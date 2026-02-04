import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[STRIPE-DASHBOARD] No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("[STRIPE-DASHBOARD] Invalid user", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ ADMIN CHECK ============
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("[STRIPE-DASHBOARD] User is not admin", user.id);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[STRIPE-DASHBOARD] Admin verified:", user.email);

    // ============ STRIPE DATA FETCH ============
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Fetch subscriptions
    const activeSubscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    const allSubscriptions = await stripe.subscriptions.list({
      limit: 100,
    });

    const canceledSubscriptions = await stripe.subscriptions.list({
      status: "canceled",
      limit: 100,
    });

    const trialingSubscriptions = await stripe.subscriptions.list({
      status: "trialing",
      limit: 100,
    });

    // Fetch customers
    const customers = await stripe.customers.list({
      limit: 100,
    });

    // Fetch invoices for revenue calculation
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const invoices = await stripe.invoices.list({
      status: "paid",
      created: {
        gte: Math.floor(lastMonthStart.getTime() / 1000),
      },
      limit: 100,
    });

    // Fetch ALL paid invoices for total revenue
    const allPaidInvoices = await stripe.invoices.list({
      status: "paid",
      limit: 100,
    });

    // Calculate MRR from active subscriptions
    let mrr = 0;
    for (const sub of activeSubscriptions.data) {
      if (sub.items.data.length > 0) {
        const item = sub.items.data[0];
        const amount = item.price?.unit_amount || 0;
        const interval = item.price?.recurring?.interval || "month";
        
        if (interval === "year") {
          mrr += amount / 12;
        } else if (interval === "month") {
          mrr += amount;
        }
      }
    }
    mrr = mrr / 100;

    // Calculate revenue for current and last month
    let currentMonthRevenue = 0;
    let lastMonthRevenue = 0;

    for (const invoice of invoices.data) {
      const invoiceDate = new Date(invoice.created * 1000);
      if (invoiceDate >= currentMonthStart) {
        currentMonthRevenue += invoice.amount_paid / 100;
      } else {
        lastMonthRevenue += invoice.amount_paid / 100;
      }
    }

    // Calculate total revenue (all time)
    let totalRevenue = 0;
    for (const invoice of allPaidInvoices.data) {
      totalRevenue += invoice.amount_paid / 100;
    }

    // Calculate churn rate
    const totalSubscriptions = allSubscriptions.data.length || 1;
    const canceledCount = canceledSubscriptions.data.length;
    const churnRate = (canceledCount / totalSubscriptions) * 100;

    // Calculate monthly churns (canceled this month)
    const monthlyChurns = canceledSubscriptions.data.filter((sub: { canceled_at: number | null }) => {
      const canceledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000) : null;
      return canceledAt && canceledAt >= currentMonthStart;
    }).length;

    // Calculate growth
    const growth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    // Calculate average ticket
    const activeCount = activeSubscriptions.data.length || 1;
    const averageTicket = mrr / activeCount;

    // Calculate estimated LTV
    const churnRateDecimal = churnRate / 100 || 0.01;
    const estimatedLTV = mrr / churnRateDecimal;

    // Get recent invoices for chart data (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const recentInvoices = await stripe.invoices.list({
      status: "paid",
      created: {
        gte: Math.floor(sixMonthsAgo.getTime() / 1000),
      },
      limit: 100,
    });

    // Group revenue by month
    const revenueByMonth: { [key: string]: number } = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    for (const invoice of recentInvoices.data) {
      const date = new Date(invoice.created * 1000);
      const key = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
      revenueByMonth[key] = (revenueByMonth[key] || 0) + invoice.amount_paid / 100;
    }

    const revenueChartData = Object.entries(revenueByMonth)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))
      .reverse();

    // Get subscription growth over time
    const subscriptionsByMonth: { [key: string]: number } = {};
    for (const sub of allSubscriptions.data) {
      const date = new Date(sub.created * 1000);
      const key = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
      subscriptionsByMonth[key] = (subscriptionsByMonth[key] || 0) + 1;
    }

    const subscriptionChartData = Object.entries(subscriptionsByMonth)
      .map(([month, count]) => ({ month, subscriptions: count }))
      .reverse()
      .slice(-6);

    const dashboardData = {
      mrr: Math.round(mrr * 100) / 100,
      activeSubscribers: activeSubscriptions.data.length,
      totalCustomers: customers.data.length,
      churnRate: Math.round(churnRate * 100) / 100,
      currentMonthRevenue: Math.round(currentMonthRevenue * 100) / 100,
      lastMonthRevenue: Math.round(lastMonthRevenue * 100) / 100,
      growth: Math.round(growth * 100) / 100,
      revenueChartData,
      subscriptionChartData,
      // Novas métricas
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageTicket: Math.round(averageTicket * 100) / 100,
      estimatedLTV: Math.round(estimatedLTV * 100) / 100,
      monthlyChurns,
      trialingCount: trialingSubscriptions.data.length,
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[STRIPE-DASHBOARD] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

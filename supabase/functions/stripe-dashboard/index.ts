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
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[STRIPE-DASHBOARD] No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify JWT via getClaims (compatible with new signing keys)
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.error("[STRIPE-DASHBOARD] Invalid JWT", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user = { id: claimsData.claims.sub as string, email: claimsData.claims.email as string | undefined };

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

    // ============ DATE RANGE FILTER ============
    let body = {};
    try {
      if (req.headers.get("content-type")?.includes("application/json")) {
        body = await req.json();
      }
    } catch (e) {
      console.log("[STRIPE-DASHBOARD] No JSON body", e);
    }
    
    const { from, to } = body as any;
    const fromUnix = from ? Math.floor(new Date(from).getTime() / 1000) : undefined;
    const toUnix = to ? Math.floor(new Date(to).getTime() / 1000) : undefined;

    // ============ STRIPE DATA FETCH ============
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Fetch subscriptions
    let activeSubsParams: any = { status: "active", limit: 100 };
    if (fromUnix || toUnix) {
      activeSubsParams.created = {};
      if (fromUnix) activeSubsParams.created.gte = fromUnix;
      if (toUnix) activeSubsParams.created.lte = toUnix;
    }
    const activeSubscriptions = await stripe.subscriptions.list(activeSubsParams);

    let allSubsParams: any = { limit: 100 };
    if (fromUnix || toUnix) {
      allSubsParams.created = {};
      if (fromUnix) allSubsParams.created.gte = fromUnix;
      if (toUnix) allSubsParams.created.lte = toUnix;
    }
    const allSubscriptions = await stripe.subscriptions.list(allSubsParams);

    let canceledSubsParams: any = { status: "canceled", limit: 100 };
    if (fromUnix || toUnix) {
      canceledSubsParams.created = {};
      if (fromUnix) canceledSubsParams.created.gte = fromUnix;
      if (toUnix) canceledSubsParams.created.lte = toUnix;
    }
    const canceledSubscriptions = await stripe.subscriptions.list(canceledSubsParams);

    let trialingSubsParams: any = { status: "trialing", limit: 100 };
    if (fromUnix || toUnix) {
      trialingSubsParams.created = {};
      if (fromUnix) trialingSubsParams.created.gte = fromUnix;
      if (toUnix) trialingSubsParams.created.lte = toUnix;
    }
    const trialingSubscriptions = await stripe.subscriptions.list(trialingSubsParams);

    // Fetch customers
    let customersParams: any = { limit: 100 };
    if (fromUnix || toUnix) {
      customersParams.created = {};
      if (fromUnix) customersParams.created.gte = fromUnix;
      if (toUnix) customersParams.created.lte = toUnix;
    }
    const customers = await stripe.customers.list(customersParams);

    // Fetch invoices for revenue calculation
    const now = new Date();
    const currentMonthStart = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = from ? new Date(currentMonthStart.getTime() - (currentMonthStart.getTime() - (to ? new Date(to).getTime() : now.getTime()))) : new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const invoices = await stripe.invoices.list({
      status: "paid",
      created: {
        gte: Math.floor(lastMonthStart.getTime() / 1000),
      },
      limit: 100,
    });

    // Fetch ALL paid invoices for total revenue (if date range is used, only for that range)
    let allPaidInvoicesParams: any = { status: "paid", limit: 100 };
    if (fromUnix || toUnix) {
      allPaidInvoicesParams.created = {};
      if (fromUnix) allPaidInvoicesParams.created.gte = fromUnix;
    if (toUnix) allPaidInvoicesParams.created.lte = toUnix;
    }
    const allPaidInvoices = await stripe.invoices.list(allPaidInvoicesParams);

    // ============ HOTMART DATA FETCH ============
    const { data: allHotmartSalesData, error: hotmartError } = await supabaseAdmin.from("hotmart_sales").select("*");
    const allHotmartSales = allHotmartSalesData || [];

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

    // ============ HOTMART AGGREGATION ============
    let hotmartActiveCount = 0;
    let hotmartMrr = 0;
    let hotmartTotalRevenue = 0;
    let hotmartCanceledCount = 0;
    let hotmartMonthlyChurns = 0;
    let hotmartCurrentMonthRevenue = 0;
    let hotmartLastMonthRevenue = 0;

    for (const sale of allHotmartSales) {
      const price = sale.h_price_value || 197; // Fallback to 197 if null
      const saleDate = new Date(sale.h_purchase_date || sale.created_at || Date.now());

      // Only count within date filter if from/to are provided
      const isWithinFilter = (!from || saleDate >= new Date(from)) && (!to || saleDate <= new Date(to));

      if (isWithinFilter) {
        hotmartTotalRevenue += price;

        if (saleDate >= currentMonthStart) {
          hotmartCurrentMonthRevenue += price;
        } else if (saleDate >= lastMonthStart) {
          hotmartLastMonthRevenue += price;
        }

        // Group by month for revenue chart (Stripe uses recentInvoices only, but we use allHotmartSales)
        if (saleDate >= sixMonthsAgo) {
          const rKey = `${monthNames[saleDate.getMonth()]}/${saleDate.getFullYear().toString().slice(-2)}`;
          const existingRev = revenueChartData.find(d => d.month === rKey);
          if (existingRev) existingRev.revenue += price;
        }
      }

      // Active / Canceled / MRR (all time, not date filtered)
      if (sale.h_status === "APPROVED" || sale.h_status === "COMPLETED") {
        hotmartActiveCount++;
        hotmartMrr += price;

        // Add to subscription chart
        if (saleDate >= sixMonthsAgo) {
          const key = `${monthNames[saleDate.getMonth()]}/${saleDate.getFullYear().toString().slice(-2)}`;
          const existingSub = subscriptionChartData.find(d => d.month === key);
          if (existingSub) existingSub.subscriptions += 1;
        }
      } else if (sale.h_status === "CANCELED" || sale.h_status === "REFUNDED") {
        hotmartCanceledCount++;
        const cancelDate = sale.updated_at ? new Date(sale.updated_at) : saleDate;
        if (cancelDate >= currentMonthStart) {
          hotmartMonthlyChurns++;
        }
      }
    }

    const combinedMrr = mrr + hotmartMrr;
    const combinedActive = activeSubscriptions.data.length + hotmartActiveCount;
    const combinedCustomers = customers.data.length + allHotmartSales.length;
    
    const combinedTotalSubscriptions = (allSubscriptions.data.length || 1) + hotmartActiveCount + hotmartCanceledCount;
    const combinedChurnRate = ((canceledCount + hotmartCanceledCount) / combinedTotalSubscriptions) * 100;
    
    const combinedCurrentRevenue = currentMonthRevenue + hotmartCurrentMonthRevenue;
    const combinedLastRevenue = lastMonthRevenue + hotmartLastMonthRevenue;
    const combinedGrowth = combinedLastRevenue > 0 
      ? ((combinedCurrentRevenue - combinedLastRevenue) / combinedLastRevenue) * 100 
      : 0;
      
    const combinedAverageTicket = combinedActive > 0 ? combinedMrr / combinedActive : 0;
    const combinedLTV = combinedChurnRate > 0 ? combinedMrr / (combinedChurnRate / 100) : 0;

    const dashboardData = {
      mrr: Math.round(combinedMrr * 100) / 100,
      activeSubscribers: combinedActive,
      totalCustomers: combinedCustomers,
      churnRate: Math.round(combinedChurnRate * 100) / 100,
      currentMonthRevenue: Math.round(combinedCurrentRevenue * 100) / 100,
      lastMonthRevenue: Math.round(combinedLastRevenue * 100) / 100,
      growth: Math.round(combinedGrowth * 100) / 100,
      revenueChartData,
      subscriptionChartData,
      // Novas métricas
      totalRevenue: Math.round((totalRevenue + hotmartTotalRevenue) * 100) / 100,
      averageTicket: Math.round(combinedAverageTicket * 100) / 100,
      estimatedLTV: Math.round(combinedLTV * 100) / 100,
      monthlyChurns: monthlyChurns + hotmartMonthlyChurns,
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

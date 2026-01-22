import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Fetch subscriptions (active and all)
    const activeSubscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    const allSubscriptions = await stripe.subscriptions.list({
      limit: 100,
    });

    // Fetch canceled subscriptions for churn calculation
    const canceledSubscriptions = await stripe.subscriptions.list({
      status: "canceled",
      limit: 100,
    });

    // Fetch customers
    const customers = await stripe.customers.list({
      limit: 100,
    });

    // Fetch invoices for revenue calculation (last 2 months)
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

    // Calculate MRR from active subscriptions
    let mrr = 0;
    for (const sub of activeSubscriptions.data) {
      if (sub.items.data.length > 0) {
        const item = sub.items.data[0];
        const amount = item.price?.unit_amount || 0;
        const interval = item.price?.recurring?.interval || "month";
        
        // Normalize to monthly
        if (interval === "year") {
          mrr += amount / 12;
        } else if (interval === "month") {
          mrr += amount;
        }
      }
    }
    mrr = mrr / 100; // Convert from cents to currency

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

    // Calculate churn rate
    const totalSubscriptions = allSubscriptions.data.length || 1;
    const canceledCount = canceledSubscriptions.data.length;
    const churnRate = (canceledCount / totalSubscriptions) * 100;

    // Calculate growth
    const growth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

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
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe dashboard error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

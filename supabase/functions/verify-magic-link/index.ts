import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função findExistingUserIdByEmail removida por causar timeout com listUsers (paginação excessiva)

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Token é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase com service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Token fetch: allow reuse while the purchase access link is still valid.
    // Email/security scanners can pre-open links before the buyer clicks them.
    const now = new Date();
    const { data: tokenRow, error: fetchError } = await supabaseAdmin
      .from("magic_link_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (fetchError || !tokenRow) {
      console.error("[VERIFY] Token não encontrado:", fetchError);
      return new Response(
        JSON.stringify({ error: "Link inválido. Solicite um novo link de acesso." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Link expirado: em vez de travar o assinante, reenviamos automaticamente
    // um link novo para o mesmo e-mail (nenhum risco: vai para a mesma caixa).
    if (new Date(tokenRow.expires_at).getTime() <= now.getTime()) {
      const expiredEmail = String(tokenRow.email).toLowerCase().trim();
      let resent = false;
      try {
        const resendResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-magic-link`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              email: expiredEmail,
              name: tokenRow.name ?? undefined,
              phone: tokenRow.phone ?? undefined,
            }),
          },
        );
        resent = resendResponse.ok;
      } catch (resendError) {
        console.error("[VERIFY] Falha ao reenviar link expirado:", resendError);
      }

      const [localPart, domainPart] = expiredEmail.split("@");
      const maskedEmail = `${localPart.slice(0, 2)}***@${domainPart ?? ""}`;

      return new Response(
        JSON.stringify({
          error: resent
            ? `Este link expirou. Acabamos de enviar um link novo para ${maskedEmail}. Confira seu e-mail.`
            : "Este link expirou. Solicite um novo link de acesso.",
          expired: true,
          resent,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = tokenRow;


    // Best-effort audit only. Do not block login if another request/scanner
    // already marked used_at, as long as expires_at is still valid.
    const { error: updateError } = await supabaseAdmin
      .from("magic_link_tokens")
      .update({ used_at: now.toISOString() })
      .eq("id", tokenData.id)
      .is("used_at", null)  // Critical: Only update if still unused
      .select("id");

    if (updateError) {
      console.warn("[VERIFY] Não foi possível registrar used_at, continuando login:", updateError);
    }

    console.log("[VERIFY-MAGIC-LINK] Token atomically marked as used:", tokenData.id);

    const email = tokenData.email.toLowerCase().trim();
    const userName = tokenData.name;
    const userPhone = tokenData.phone;

    console.log("[VERIFY-MAGIC-LINK] Processing token verification for:", email);

    // 1. Garantir que o usuário existe no Auth (se já existir, vai dar erro que ignoraremos)
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
    });

    if (createError && !createError.message.includes("already exists") && !createError.message.includes("already registered")) {
      console.warn("[VERIFY-MAGIC-LINK] Unexpected error creating user (continuing anyway):", createError);
    }

    // 2. Gerar link de login para o usuário (isso retorna o objeto user completo com o ID)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
    });

    if (linkError || !linkData) {
      console.error("[VERIFY-MAGIC-LINK] Error generating link:", linkError);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar sessão" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = linkData.user.id;

    // 3. Atualizar perfil com nome e telefone se fornecidos
    const profileUpdates: Record<string, string> = {};
    if (userName) profileUpdates.name = userName;
    if (userPhone) profileUpdates.phone = userPhone;

    if (Object.keys(profileUpdates).length > 0) {
      // Aguardar um momento para o trigger criar o perfil (se for usuário novo)
      if (!createError) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      let attempts = 0;
      let updated = false;
      while (!updated && attempts < 3) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update(profileUpdates)
          .eq("user_id", userId);

        if (!error) {
          updated = true;
          console.log("[VERIFY-MAGIC-LINK] Profile updated with name:", userName);
        } else {
          attempts++;
          console.log("[VERIFY-MAGIC-LINK] Retry attempt", attempts, "for profile update");
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Extrair hashed_token das propriedades (novo fluxo PKCE)
    const hashedToken = linkData.properties?.hashed_token;

    if (!hashedToken) {
      console.error("[VERIFY-MAGIC-LINK] Hashed token not found in link properties:", JSON.stringify(linkData.properties));
      return new Response(
        JSON.stringify({ error: "Erro ao processar autenticação" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[VERIFY-MAGIC-LINK] Hashed token obtained, verifying OTP...");

    // Verificar OTP para criar sessão diretamente no servidor
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: hashedToken,
      type: "email",
    });

    if (sessionError || !sessionData.session) {
      console.error("[VERIFY-MAGIC-LINK] Error verifying OTP:", sessionError);
      return new Response(
        JSON.stringify({ error: "Erro ao criar sessão" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = sessionData.session.access_token;
    const refreshToken = sessionData.session.refresh_token;

    console.log("[VERIFY-MAGIC-LINK] Session created successfully for:", email);

    // --- STRIPE SUBSCRIPTION CHECK + LOCAL SYNC ---
    let isSubscribed = false;
    let resolvedProductId: string | null = null;
    let resolvedPeriodEnd: string | null = null;
    let resolvedBillingCycle: string | null = null;
    let resolvedBillingProvider: string | null = null;

    // Check local subscription first (for existing users)
    try {
      const { data: localSub } = await supabaseAdmin
        .from("subscriptions")
        .select("status, product_id, current_period_end, billing_cycle, billing_provider")
        .eq("user_id", userId)
        .in("status", ["active", "trialing"])
        .maybeSingle();

      if (localSub) {
        console.log("[VERIFY-MAGIC-LINK] Found active local subscription:", localSub.product_id);
        isSubscribed = true;
        resolvedProductId = localSub.product_id ?? null;
        resolvedPeriodEnd = localSub.current_period_end ?? null;
        resolvedBillingCycle = localSub.billing_cycle ?? null;
        resolvedBillingProvider = localSub.billing_provider ?? null;
      }
    } catch (localSubErr) {
      console.warn("[VERIFY-MAGIC-LINK] Local sub check failed:", localSubErr);
    }


    let stripeSync: {
      customerId: string;
      subscriptionId: string | null;
      productId: string | null;
      subscriptionEnd: string | null;
    } | null = null;
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const Stripe = (await import("https://esm.sh/stripe@18.5.0")).default;
        const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

        const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 10 });

        if (customers.data.length > 0) {
          for (const customer of customers.data) {
            const customerId = customer.id;

            const activeSubscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
            const subscription = activeSubscriptions.data.find(s => s.status === "active" || s.status === "trialing");

            if (subscription) {
              const productId = (subscription.items.data[0]?.price?.product as string | null) ?? null;
              stripeSync = {
                customerId,
                subscriptionId: subscription.id,
                productId,
                subscriptionEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
              };
              isSubscribed = true;
            }

            if (isSubscribed) break;

          // Check for recent one-off payments if no subscription
          if (!isSubscribed) {
            const checkoutSessions = await stripe.checkout.sessions.list({
              customer: customerId,
              status: 'complete',
              limit: 5,
            });

            const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
            const validSession = checkoutSessions.data.find((s: any) =>
              s.payment_status === 'paid' &&
              s.mode === 'payment' &&
              s.created > thirtyDaysAgo
            );

            if (validSession) {
              const lineItems = await stripe.checkout.sessions.listLineItems(validSession.id, { limit: 1 });
              const productId = (lineItems.data[0]?.price?.product as string | null) ?? null;
              isSubscribed = true;
              stripeSync = {
                customerId,
                subscriptionId: null,
                productId,
                subscriptionEnd: new Date((validSession.created + (365 * 24 * 60 * 60)) * 1000).toISOString(),
              };
            }
          }

            if (isSubscribed) {
              break;
            }
          }
        }

        if (stripeSync) {
          const { error: profileSyncError } = await supabaseAdmin.from("profiles").upsert({
            user_id: userId,
            email,
            stripe_customer_id: stripeSync.customerId,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          if (profileSyncError) console.error("[VERIFY-MAGIC-LINK] Profile Stripe sync failed:", profileSyncError);

          const { error: subscriptionSyncError } = await supabaseAdmin.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: stripeSync.customerId,
            stripe_subscription_id: stripeSync.subscriptionId,
            status: "active",
            product_id: stripeSync.productId,
            current_period_end: stripeSync.subscriptionEnd,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          if (subscriptionSyncError) console.error("[VERIFY-MAGIC-LINK] Subscription Stripe sync failed:", subscriptionSyncError);

          resolvedProductId = stripeSync.productId ?? resolvedProductId;
          resolvedPeriodEnd = stripeSync.subscriptionEnd ?? resolvedPeriodEnd;
          resolvedBillingProvider = "stripe";
        }
      }
    } catch (stripeErr) {
      console.error("[VERIFY-MAGIC-LINK] Error checking Stripe (continuing anyway):", stripeErr);
    }
    // ---------------------------------

    return new Response(
      JSON.stringify({
        success: true,
        subscribed: isSubscribed,
        product_id: resolvedProductId,
        subscription_end: resolvedPeriodEnd,
        billing_cycle: resolvedBillingCycle,
        billing_provider: resolvedBillingProvider ?? "stripe",
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      }),

      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-magic-link:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

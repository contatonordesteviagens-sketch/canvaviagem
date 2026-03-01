import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Atomic token fetch: Only select unused and non-expired tokens
    const now = new Date();
    const { data: tokenData, error: fetchError } = await supabaseAdmin
      .from("magic_link_tokens")
      .select("*")
      .eq("token", token)
      .is("used_at", null)  // Only select unused tokens (prevents race condition)
      .gt("expires_at", now.toISOString())  // Only select non-expired tokens
      .single();

    if (fetchError || !tokenData) {
      console.error("Token not found or already used:", fetchError);
      return new Response(
        JSON.stringify({ error: "Token inválido, já utilizado ou expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Atomically mark token as used with WHERE clause to prevent race condition
    // This ensures only one request can successfully mark the token as used
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from("magic_link_tokens")
      .update({ used_at: now.toISOString() })
      .eq("id", tokenData.id)
      .is("used_at", null)  // Critical: Only update if still unused
      .select("id");

    if (updateError || !updateResult || updateResult.length === 0) {
      console.error("Token already used (race condition prevented):", updateError);
      return new Response(
        JSON.stringify({ error: "Este link já foi utilizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[VERIFY-MAGIC-LINK] Token atomically marked as used:", tokenData.id);

    const email = tokenData.email;
    const userName = tokenData.name;
    const userPhone = tokenData.phone;

    // Verificar se o usuário existe de forma escalável
    const { data: listData, error: userError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUser = listData?.users?.find(u => u.email === email) ?? null;

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;

      // Atualizar nome e telefone no perfil se fornecidos
      const profileUpdates: Record<string, string> = {};
      if (userName) profileUpdates.name = userName;
      if (userPhone) profileUpdates.phone = userPhone;

      if (Object.keys(profileUpdates).length > 0) {
        // Tentar atualizar com retry para garantir que o profile existe
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
    } else {
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Erro ao criar conta" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;

      // Salvar nome e telefone no perfil do novo usuário
      const newProfileUpdates: Record<string, string> = {};
      if (userName) newProfileUpdates.name = userName;
      if (userPhone) newProfileUpdates.phone = userPhone;

      if (Object.keys(newProfileUpdates).length > 0) {
        // Aguardar um momento para o trigger criar o perfil
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Tentar atualizar com retry
        let attempts = 0;
        let updated = false;
        while (!updated && attempts < 3) {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update(newProfileUpdates)
            .eq("user_id", userId);

          if (!error) {
            updated = true;
            console.log("[VERIFY-MAGIC-LINK] New user profile updated with name:", userName);
          } else {
            attempts++;
            console.log("[VERIFY-MAGIC-LINK] Retry attempt", attempts, "for new user profile update");
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    }

    console.log("[VERIFY-MAGIC-LINK] Processing token verification for:", email);

    // Gerar link de login para o usuário
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

    // --- STRIPE SUBSCRIPTION CHECK ---
    let isSubscribed = false;
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey) {
        const Stripe = (await import("https://esm.sh/stripe@18.5.0")).default;
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

        const customers = await stripe.customers.list({
          email: email.toLowerCase(),
          limit: 1
        });

        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;

          // Check for active or trialing subscriptions
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: "active",
            limit: 1,
          });

          if (subscriptions.data.length > 0) {
            isSubscribed = true;
          } else {
            const trialing = await stripe.subscriptions.list({
              customer: customerId,
              status: "trialing",
              limit: 1,
            });
            isSubscribed = trialing.data.length > 0;
          }

          // Check for recent one-off payments if no subscription
          if (!isSubscribed) {
            const checkoutSessions = await stripe.checkout.sessions.list({
              customer: customerId,
              status: 'complete',
              limit: 5,
            });

            const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
            isSubscribed = checkoutSessions.data.some((s: any) =>
              s.payment_status === 'paid' &&
              s.mode === 'payment' &&
              s.created > thirtyDaysAgo
            );
          }
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

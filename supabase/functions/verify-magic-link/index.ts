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

    // Buscar token no banco
    const { data: tokenData, error: fetchError } = await supabaseAdmin
      .from("magic_link_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (fetchError || !tokenData) {
      console.error("Token not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Token inválido ou não encontrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se o token já foi usado
    if (tokenData.used_at) {
      return new Response(
        JSON.stringify({ error: "Este link já foi utilizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se o token expirou
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: "Este link expirou. Solicite um novo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar token como usado
    const { error: updateError } = await supabaseAdmin
      .from("magic_link_tokens")
      .update({ used_at: now.toISOString() })
      .eq("id", tokenData.id);

    if (updateError) {
      console.error("Error updating token:", updateError);
    }

    const email = tokenData.email;
    const userName = tokenData.name;
    const userPhone = tokenData.phone;

    // Verificar se o usuário existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      
      // Atualizar nome e telefone no perfil se fornecidos
      const profileUpdates: Record<string, string> = {};
      if (userName) profileUpdates.name = userName;
      if (userPhone) profileUpdates.phone = userPhone;
      
      if (Object.keys(profileUpdates).length > 0) {
        await supabaseAdmin
          .from("profiles")
          .update(profileUpdates)
          .eq("user_id", userId);
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
        await new Promise(resolve => setTimeout(resolve, 500));
        await supabaseAdmin
          .from("profiles")
          .update(newProfileUpdates)
          .eq("user_id", userId);
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

    return new Response(
      JSON.stringify({
        success: true,
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

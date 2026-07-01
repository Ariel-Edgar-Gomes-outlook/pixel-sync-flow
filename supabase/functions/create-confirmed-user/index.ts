import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const validationError = (message: string) => jsonResponse({ ok: false, error: message });

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Método não permitido" }, 405);
  }

  try {
    const { email, password, name } = await req.json();

    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const normalizedName = String(name ?? "").trim();
    const normalizedPassword = String(password ?? "");

    if (!normalizedName) {
      return validationError("Nome obrigatório");
    }

    if (!isValidEmail(normalizedEmail)) {
      return validationError("Email inválido");
    }

    if (normalizedPassword.length < 6) {
      return validationError("A senha deve ter pelo menos 6 caracteres");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase environment variables are missing");
      return jsonResponse({ ok: false, error: "Configuração do servidor incompleta" }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: normalizedPassword,
      email_confirm: true,
      user_metadata: { name: normalizedName },
    });

    if (error) {
      const message = error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")
        ? "Este email já está registado. Faça login ou recupere a senha."
        : error.message;

      return validationError(message);
    }

    if (data.user?.id) {
      const { error: settingsError } = await adminClient
        .from("notification_settings")
        .upsert({ user_id: data.user.id }, { onConflict: "user_id" });

      if (settingsError) {
        console.error("Error creating notification settings:", settingsError);
        return jsonResponse({ ok: false, error: "A conta foi criada, mas houve erro ao preparar as configurações iniciais" }, 500);
      }
    }

    return jsonResponse({ ok: true, userId: data.user?.id });
  } catch (error) {
    console.error("Error creating confirmed user:", error);
    return jsonResponse({ ok: false, error: "Não foi possível criar a conta agora" }, 500);
  }
});
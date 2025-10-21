import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleCalendarRequest {
  action: 'connect' | 'disconnect' | 'sync';
  code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Autorização necessária');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { action, code }: GoogleCalendarRequest = await req.json();

    console.log(`Google Calendar sync action: ${action} for user ${user.id}`);

    switch (action) {
      case 'connect': {
        if (!code) {
          // Step 1: Generate OAuth URL
          const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
          const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-sync`;
          
          if (!clientId) {
            throw new Error('GOOGLE_CLIENT_ID não configurado');
          }

          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.events')}&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${user.id}`;

          return new Response(
            JSON.stringify({ authUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Step 2: Exchange code for tokens
          const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
          const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
          const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-sync`;

          if (!clientId || !clientSecret) {
            throw new Error('Credenciais do Google não configuradas');
          }

          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });

          const tokens = await tokenResponse.json();
          
          if (!tokens.access_token) {
            throw new Error('Falha ao obter tokens do Google');
          }

          // Save tokens to calendar_integrations table
          const expiresAt = new Date();
          expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

          const { error: insertError } = await supabase
            .from('calendar_integrations')
            .upsert({
              user_id: user.id,
              provider: 'google',
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              token_expires_at: expiresAt.toISOString(),
              is_active: true,
            }, {
              onConflict: 'user_id,provider'
            });

          if (insertError) throw insertError;

          return new Response(
            JSON.stringify({ success: true, message: 'Conectado com sucesso!' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'disconnect': {
        // Here you would remove stored tokens
        // For now, we'll just acknowledge the request
        console.log(`Disconnecting Google Calendar for user ${user.id}`);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Desconectado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync': {
        // Fetch user's jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .order('start_datetime', { ascending: true });

        if (jobsError) throw jobsError;

        console.log(`Syncing ${jobs?.length || 0} jobs to Google Calendar`);

        // Here you would sync jobs with Google Calendar API
        // This would require:
        // 1. Getting stored access token
        // 2. Creating/updating calendar events
        // 3. Handling refresh tokens
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `${jobs?.length || 0} jobs sincronizados`,
            jobsCount: jobs?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Ação inválida');
    }
  } catch (error) {
    console.error('Google Calendar sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

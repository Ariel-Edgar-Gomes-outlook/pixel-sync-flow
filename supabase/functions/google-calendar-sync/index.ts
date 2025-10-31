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

    const url = new URL(req.url);
    
    // Handle OAuth callback from Google (GET request with code parameter)
    if (req.method === 'GET' && url.searchParams.has('code')) {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state'); // This is the user_id
      
      if (!code || !state) {
        return new Response('Invalid OAuth callback', { status: 400 });
      }

      const userId = state;
      
      try {
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-sync`;

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
            user_id: userId,
            provider: 'google',
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: expiresAt.toISOString(),
            is_active: true,
          }, {
            onConflict: 'user_id,provider'
          });

        if (insertError) {
          console.error('Error saving integration:', insertError);
          throw insertError;
        }

        // Redirect back to home page with success message
        const appUrl = Deno.env.get('APP_URL') || 'https://a0c0e2de-e5bb-43a1-bbf9-26ccae7a8f31.lovableproject.com';
        return Response.redirect(`${appUrl}/?connected=true`, 302);
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        const appUrl = Deno.env.get('APP_URL') || 'https://a0c0e2de-e5bb-43a1-bbf9-26ccae7a8f31.lovableproject.com';
        return Response.redirect(`${appUrl}/?error=connection_failed`, 302);
      }
    }

    // For all other requests, require authentication
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
        // Generate OAuth URL
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-sync`;
        
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
      }

      case 'disconnect': {
        console.log(`Disconnecting Google Calendar for user ${user.id}`);
        
        const { error: updateError } = await supabase
          .from('calendar_integrations')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('provider', 'google');

        if (updateError) {
          console.error('Error disconnecting:', updateError);
          throw new Error('Erro ao desconectar Google Calendar');
        }
        
        return new Response(
          JSON.stringify({ success: true, message: 'Desconectado com sucesso' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync': {
        // Get calendar integration
        const { data: integration, error: integrationError } = await supabase
          .from('calendar_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'google')
          .eq('is_active', true)
          .single();

        if (integrationError || !integration) {
          throw new Error('Google Calendar não conectado');
        }

        // Check if token needs refresh
        let accessToken = integration.access_token;
        const tokenExpiresAt = new Date(integration.token_expires_at || 0);
        
        if (tokenExpiresAt <= new Date()) {
          console.log('Token expired, refreshing...');
          
          const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
          const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
          
          if (!clientId || !clientSecret || !integration.refresh_token) {
            throw new Error('Não foi possível renovar o token');
          }

          const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              refresh_token: integration.refresh_token,
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'refresh_token',
            }),
          });

          const refreshData = await refreshResponse.json();
          
          if (!refreshData.access_token) {
            throw new Error('Falha ao renovar token');
          }

          accessToken = refreshData.access_token;
          
          // Update token in database
          const newExpiresAt = new Date();
          newExpiresAt.setSeconds(newExpiresAt.getSeconds() + refreshData.expires_in);
          
          await supabase
            .from('calendar_integrations')
            .update({
              access_token: accessToken,
              token_expires_at: newExpiresAt.toISOString(),
            })
            .eq('id', integration.id);
        }

        // Fetch user's jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, title, description, start_datetime, end_datetime, location, google_calendar_event_id')
          .eq('created_by', user.id)
          .order('start_datetime', { ascending: true });

        if (jobsError) throw jobsError;

        console.log(`Syncing ${jobs?.length || 0} jobs to Google Calendar`);

        let syncedCount = 0;
        let errors = [];

        // Sync each job with Google Calendar
        for (const job of jobs || []) {
          try {
            const event = {
              summary: job.title,
              description: job.description || '',
              location: job.location || '',
              start: {
                dateTime: job.start_datetime,
                timeZone: 'Africa/Luanda',
              },
              end: {
                dateTime: job.end_datetime || job.start_datetime,
                timeZone: 'Africa/Luanda',
              },
            };

            let eventId = job.google_calendar_event_id;
            let calendarResponse;

            if (eventId) {
              // Update existing event
              calendarResponse = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
                {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(event),
                }
              );
            } else {
              // Create new event
              calendarResponse = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(event),
                }
              );
            }

            if (!calendarResponse.ok) {
              throw new Error(`Google Calendar API error: ${calendarResponse.statusText}`);
            }

            const calendarData = await calendarResponse.json();
            
            // Update job with event ID
            if (!eventId) {
              await supabase
                .from('jobs')
                .update({ google_calendar_event_id: calendarData.id })
                .eq('id', job.id);
            }

            syncedCount++;
          } catch (error) {
            console.error(`Error syncing job ${job.id}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            errors.push({ jobId: job.id, error: errorMessage });
          }
        }

        console.log(`Synced ${syncedCount} of ${jobs?.length || 0} jobs`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `${syncedCount} de ${jobs?.length || 0} jobs sincronizados`,
            syncedCount,
            totalJobs: jobs?.length || 0,
            errors: errors.length > 0 ? errors : undefined,
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendNotificationRequest {
  deliverable_id: string;
  client_email: string;
  client_name: string;
  job_title: string;
  file_name: string;
  file_url: string;
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

    const {
      deliverable_id,
      client_email,
      client_name,
      job_title,
      file_name,
      file_url,
    }: SendNotificationRequest = await req.json();

    console.log(`Sending deliverable notification for ${deliverable_id} to ${client_email}`);

    // Create notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: user.id,
        type: 'deliverable_sent',
        payload: {
          deliverable_id,
          client_email,
          client_name,
          job_title,
          file_name,
          file_url,
        },
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw new Error('Erro ao criar notificação');
    }

    // In a real implementation, you would send an email here using a service like:
    // - Resend (https://resend.com)
    // - SendGrid
    // - Mailgun
    // For now, we'll just log the action

    console.log(`Notification created successfully for deliverable ${deliverable_id}`);
    console.log(`Email would be sent to: ${client_email}`);
    console.log(`Subject: Novo arquivo entregue: ${file_name} - ${job_title}`);
    console.log(`File URL: ${file_url}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificação enviada com sucesso',
        details: {
          client_email,
          file_name,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send deliverable notification error:', error);
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

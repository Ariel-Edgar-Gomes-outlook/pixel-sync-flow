import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Buscar pagamentos pendentes que vencem em 3 dias
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0]);

    if (paymentsError) throw paymentsError;

    console.log(`Found ${payments?.length || 0} payments due in 3 days`);

    // Para cada pagamento, verificar se já foi enviado lembrete hoje
    for (const payment of payments || []) {
      const { data: existingReminder } = await supabaseClient
        .from('payment_reminders')
        .select('*')
        .eq('payment_id', payment.id)
        .gte('sent_at', today.toISOString().split('T')[0])
        .single();

      // Se já enviou hoje, pular
      if (existingReminder) {
        console.log(`Reminder already sent today for payment ${payment.id}`);
        continue;
      }

      // Criar notificação para o owner/admin
      const { data: jobData } = await supabaseClient
        .from('jobs')
        .select('created_by')
        .eq('id', payment.quote_id)
        .single();

      if (jobData?.created_by) {
        await supabaseClient.from('notifications').insert({
          recipient_id: jobData.created_by,
          type: 'payment_reminder',
          payload: {
            payment_id: payment.id,
            client_name: payment.clients?.name,
            amount: payment.amount,
            due_date: payment.due_date,
            days_until_due: Math.floor(
              (new Date(payment.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            ),
          },
        });
      }

      // Registrar lembrete enviado
      await supabaseClient.from('payment_reminders').insert({
        payment_id: payment.id,
        type: 'upcoming',
        notification_sent: true,
      });

      console.log(`Sent reminder for payment ${payment.id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: payments?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

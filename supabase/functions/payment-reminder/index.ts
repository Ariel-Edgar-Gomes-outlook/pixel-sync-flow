import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔔 Payment reminder function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current date and 3 days from now
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    console.log(`📅 Checking payments between ${today.toISOString()} and ${threeDaysFromNow.toISOString()}`);

    // FASE 5 CORRIGIDO: Get payments due within next 3 days
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select(`
        id,
        amount,
        due_date,
        status,
        invoice_id,
        quote_id,
        clients:client_id (
          name
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', today.toISOString().split('T')[0])
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0]);

    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError);
      throw paymentsError;
    }

    console.log(`✅ Found ${payments?.length || 0} pending payments`);

    let processedCount = 0;

    for (const payment of payments || []) {
      try {
        // FASE 5 CORRIGIDO: Get recipient_id from invoice or quote
        let recipientId = null;

        if (payment.invoice_id) {
          const { data: invoice } = await supabaseClient
            .from('invoices')
            .select('user_id')
            .eq('id', payment.invoice_id)
            .single();
          
          recipientId = invoice?.user_id;
          console.log(`📧 Found recipient from invoice: ${recipientId}`);
        } else if (payment.quote_id) {
          const { data: quote } = await supabaseClient
            .from('quotes')
            .select('created_by')
            .eq('id', payment.quote_id)
            .single();
          
          recipientId = quote?.created_by;
          console.log(`📧 Found recipient from quote: ${recipientId}`);
        }

        if (!recipientId) {
          console.warn(`⚠️ No recipient found for payment ${payment.id}`);
          continue;
        }

        // Check user notification settings
        const { data: settings } = await supabaseClient
          .from('notification_settings')
          .select('payment_overdue')
          .eq('user_id', recipientId)
          .maybeSingle();

        if (!settings || !settings.payment_overdue) {
          console.log(`⚠️ Payment reminders disabled for user ${recipientId}`);
          continue;
        }

        // Check if reminder already sent today
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const { data: existingReminder } = await supabaseClient
          .from('payment_reminders')
          .select('id')
          .eq('payment_id', payment.id)
          .gte('sent_at', startOfDay)
          .maybeSingle();

        if (existingReminder) {
          console.log(`⏭️ Reminder already sent today for payment ${payment.id}`);
          continue;
        }

        // Create notification using RPC function
        const clientName = (payment as any).clients?.name || 'cliente';
        
        await supabaseClient.rpc('create_system_notification', {
          _recipient_id: recipientId,
          _type: 'payment_reminder',
          _payload: {
            title: '💰 Lembrete de Pagamento',
            message: `Pagamento de ${clientName} vence em breve`,
            payment_id: payment.id,
            amount: payment.amount,
            due_date: payment.due_date,
          },
        });

        // Update priority
        const { data: notificationId } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('type', 'payment_reminder')
          .contains('payload', { payment_id: payment.id })
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (notificationId) {
          await supabaseClient
            .from('notifications')
            .update({ priority: 'medium' })
            .eq('id', notificationId.id);
        }

        // Record reminder
        await supabaseClient
          .from('payment_reminders')
          .insert({
            payment_id: payment.id,
            type: 'before',
            notification_sent: true,
          });

        console.log(`✅ Sent reminder for payment ${payment.id}`);
        processedCount++;
      } catch (error) {
        console.error(`❌ Error processing payment ${payment.id}:`, error);
      }
    }

    console.log(`✅ Payment reminder function completed. Processed ${processedCount} payments.`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Payment reminder function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

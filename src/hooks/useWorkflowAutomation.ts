import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, isPast, startOfDay } from 'date-fns';

/**
 * FASE 3 REFATORADO: Automações de workflow otimizadas
 * - Respeita notification_settings
 * - Intervalo otimizado para 1 hora
 * - Usa create_system_notification consistentemente
 * - Try-catch e logs detalhados
 */
export function useWorkflowAutomation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const runAutomations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user notification settings
        const { data: settings } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!settings) {
          console.warn('⚠️ No notification settings found for automations');
          return;
        }

        console.log('⚙️ Running workflow automations...');

        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, status, due_date, user_id')
          .eq('user_id', user.id);

        const { data: payments } = await supabase
          .from('payments')
          .select('id, status, due_date, created_by')
          .eq('created_by', user.id);

        const now = startOfDay(new Date());

        // AUTOMATION 1: Mark invoices as overdue
        if (invoices) {
          for (const invoice of invoices) {
            try {
              if (invoice.status === 'issued' && invoice.due_date) {
                const dueDate = startOfDay(new Date(invoice.due_date));
                if (isPast(dueDate) && differenceInDays(now, dueDate) > 0) {
                  await supabase
                    .from('invoices')
                    .update({ status: 'overdue' })
                    .eq('id', invoice.id);
                  
                  console.log(`✅ Auto-marked invoice ${invoice.id} as overdue`);
                }
              }
            } catch (error) {
              console.error('❌ Error updating invoice status:', error);
            }
          }
        }

        // AUTOMATION 2: Create notifications for overdue payments
        if (settings.payment_overdue && payments) {
          for (const payment of payments) {
            try {
              if (payment.status === 'pending' && payment.due_date) {
                const dueDate = startOfDay(new Date(payment.due_date));
                const daysOverdue = differenceInDays(now, dueDate);
                
                if (daysOverdue > 0 && daysOverdue % 7 === 0) {
                  // Check if notification already sent today
                  const { data: existingNotification } = await supabase
                    .from('notifications')
                    .select('id')
                    .eq('type', 'payment_overdue')
                    .eq('recipient_id', user.id)
                    .eq('read', false)
                    .contains('payload', { payment_id: payment.id })
                    .gte('created_at', startOfDay(now).toISOString())
                    .maybeSingle();

                  if (!existingNotification) {
                    await supabase.rpc('create_system_notification', {
                      _recipient_id: user.id,
                      _type: 'payment_overdue',
                      _payload: {
                        payment_id: payment.id,
                        days_overdue: daysOverdue,
                        title: '💰 Pagamento Vencido',
                        message: `Pagamento vencido há ${daysOverdue} dias`
                      }
                    });
                    
                    console.log(`✅ Created overdue notification for payment ${payment.id}`);
                  }
                }
              }
            } catch (error) {
              console.error('❌ Error creating payment notification:', error);
            }
          }
        }

        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

        console.log('✅ Workflow automations completed');
      } catch (error) {
        console.error('❌ Error running automations:', error);
      }
    };

    // Run automations on mount and every 1 hour (optimized from 5 minutes)
    runAutomations();
    const interval = setInterval(runAutomations, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient]);
}

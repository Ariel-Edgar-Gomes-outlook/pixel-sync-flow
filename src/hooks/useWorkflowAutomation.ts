import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, isPast, isFuture, startOfDay } from 'date-fns';
import { toast } from 'sonner';

/**
 * Hook for simple workflow automations
 * FASE 3.5: Auto-updates based on time and state changes
 */
export function useWorkflowAutomation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const runAutomations = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get current data with user filters
        const { data: invoices } = await supabase
          .from('invoices')
          .select('id, status, due_date, user_id')
          .eq('user_id', user.id);

        const { data: payments } = await supabase
          .from('payments')
          .select('id, status, due_date, created_by')
          .eq('created_by', user.id);

        const now = new Date();

        // AUTOMATION 1: Mark invoices as overdue
        if (invoices) {
          for (const invoice of invoices) {
            if (invoice.status === 'issued' && invoice.due_date) {
              const dueDate = new Date(invoice.due_date);
              if (isPast(startOfDay(dueDate)) && differenceInDays(now, dueDate) > 0) {
                await supabase
                  .from('invoices')
                  .update({ status: 'overdue' })
                  .eq('id', invoice.id);
                
                console.log(`✅ Auto-marked invoice ${invoice.id} as overdue`);
              }
            }
          }
        }

        // AUTOMATION 2: Create notifications for overdue payments
        if (payments) {
          for (const payment of payments) {
            if (payment.status === 'pending' && payment.due_date) {
              const dueDate = new Date(payment.due_date);
              const daysOverdue = differenceInDays(now, dueDate);
              
              if (daysOverdue > 0 && daysOverdue % 7 === 0) {
                // Check if notification already sent today
                const { data: existingNotification } = await supabase
                  .from('notifications')
                  .select('id')
                  .eq('type', 'payment_overdue')
                  .eq('payload->>payment_id', payment.id)
                  .gte('created_at', startOfDay(now).toISOString())
                  .maybeSingle();

                if (!existingNotification) {
                  const { data: user } = await supabase.auth.getUser();
                  if (user?.user) {
                    await supabase
                      .from('notifications')
                      .insert({
                        recipient_id: user.user.id,
                        type: 'payment_overdue',
                        payload: {
                          payment_id: payment.id,
                          days_overdue: daysOverdue,
                          message: `Pagamento vencido há ${daysOverdue} dias`
                        }
                      });
                    
                    console.log(`✅ Created overdue notification for payment ${payment.id}`);
                  }
                }
              }
            }
          }
        }

        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });

      } catch (error) {
        console.error('Error running automations:', error);
      }
    };

    // Run automations on mount and every 5 minutes
    runAutomations();
    const interval = setInterval(runAutomations, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient]);
}

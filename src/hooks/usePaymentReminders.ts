import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePayments } from './usePayments';
import { differenceInDays, addDays, parseISO } from 'date-fns';

export function usePaymentReminders() {
  const queryClient = useQueryClient();
  const { data: payments } = usePayments();

  const createReminder = useMutation({
    mutationFn: async (reminder: {
      payment_id: string;
      type: string;
    }) => {
      const { error } = await supabase
        .from('payment_reminders')
        .insert(reminder);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-reminders'] });
    },
  });

  useEffect(() => {
    if (!payments) return;

    const checkReminders = async () => {
      const now = new Date();

      for (const payment of payments) {
        if (payment.status !== 'pending' || !payment.created_at) continue;

        const createdDate = parseISO(payment.created_at);
        const dueDate = addDays(createdDate, 30); // Assuming 30 days payment term
        const daysUntilDue = differenceInDays(dueDate, now);
        const daysPastDue = differenceInDays(now, dueDate);

        // Check if reminder already exists for this payment
        const { data: existingReminders } = await supabase
          .from('payment_reminders')
          .select('type')
          .eq('payment_id', payment.id);

        const reminderTypes = new Set(existingReminders?.map(r => r.type) || []);

        // Send reminder 3 days before due date
        if (daysUntilDue === 3 && !reminderTypes.has('before')) {
          createReminder.mutate({
            payment_id: payment.id,
            type: 'before',
          });

          // Create notification
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('notifications').insert({
              recipient_id: user.id,
              type: 'payment_reminder',
              payload: {
                title: '💰 Lembrete de Pagamento',
                message: `Pagamento de ${payment.clients?.name} vence em 3 dias`,
                payment_id: payment.id,
                priority: 'medium',
              },
            });
          }
        }

        // Send reminder on due date
        if (daysUntilDue === 0 && !reminderTypes.has('due')) {
          createReminder.mutate({
            payment_id: payment.id,
            type: 'due',
          });

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('notifications').insert({
              recipient_id: user.id,
              type: 'payment_reminder',
              payload: {
                title: '💰 Pagamento Vence Hoje',
                message: `Pagamento de ${payment.clients?.name} vence hoje`,
                payment_id: payment.id,
                priority: 'high',
              },
            });
          }
        }

        // Send reminder 7 days after due date
        if (daysPastDue === 7 && !reminderTypes.has('overdue')) {
          createReminder.mutate({
            payment_id: payment.id,
            type: 'overdue',
          });

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('notifications').insert({
              recipient_id: user.id,
              type: 'payment_reminder',
              payload: {
                title: '🚨 Pagamento Atrasado',
                message: `Pagamento de ${payment.clients?.name} está atrasado há 7 dias`,
                payment_id: payment.id,
                priority: 'high',
              },
            });
          }
        }
      }
    };

    // Check reminders daily
    checkReminders();
    const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000); // Every 24 hours

    return () => clearInterval(interval);
  }, [payments]);

  return { createReminder };
}

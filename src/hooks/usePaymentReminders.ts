import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePayments } from './usePayments';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

/**
 * FASE 3 REFATORADO: Lembretes de pagamento otimizados
 * - Usa due_date real da tabela
 * - Respeita notification_settings
 * - Usa create_system_notification
 * - Try-catch e logs detalhados
 */
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

  const createNotification = useMutation({
    mutationFn: async (notification: {
      recipient_id: string;
      type: string;
      payload: any;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    }) => {
      const { data, error } = await supabase
        .rpc('create_system_notification', {
          _recipient_id: notification.recipient_id,
          _type: notification.type,
          _payload: notification.payload,
        });

      if (error) throw error;

      // Update priority if provided
      if (data && notification.priority) {
        await supabase
          .from('notifications')
          .update({ priority: notification.priority })
          .eq('id', data);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    if (!payments) return;

    const checkReminders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user notification settings
        const { data: settings } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!settings || !settings.payment_overdue) {
          console.log('⚠️ Payment reminders disabled or no settings found');
          return;
        }

        console.log('💰 Checking payment reminders...');
        const now = startOfDay(new Date());

        for (const payment of payments) {
          try {
            if (payment.status !== 'pending' || !payment.due_date) continue;

            const dueDate = startOfDay(parseISO(payment.due_date));
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

              createNotification.mutate({
                recipient_id: user.id,
                type: 'payment_reminder',
                priority: 'medium',
                payload: {
                  title: '💰 Lembrete de Pagamento',
                  message: `Pagamento de ${payment.clients?.name} vence em 3 dias`,
                  payment_id: payment.id,
                },
              });

              console.log(`✅ Created before reminder for payment: ${payment.id}`);
            }

            // Send reminder on due date
            if (daysUntilDue === 0 && !reminderTypes.has('due')) {
              createReminder.mutate({
                payment_id: payment.id,
                type: 'due',
              });

              createNotification.mutate({
                recipient_id: user.id,
                type: 'payment_reminder',
                priority: 'high',
                payload: {
                  title: '💰 Pagamento Vence Hoje',
                  message: `Pagamento de ${payment.clients?.name} vence hoje`,
                  payment_id: payment.id,
                },
              });

              console.log(`✅ Created due reminder for payment: ${payment.id}`);
            }

            // Send reminder 7 days after due date
            if (daysPastDue === 7 && !reminderTypes.has('overdue')) {
              createReminder.mutate({
                payment_id: payment.id,
                type: 'overdue',
              });

              createNotification.mutate({
                recipient_id: user.id,
                type: 'payment_overdue',
                priority: 'high',
                payload: {
                  title: '🚨 Pagamento Atrasado',
                  message: `Pagamento de ${payment.clients?.name} está atrasado há 7 dias`,
                  payment_id: payment.id,
                },
              });

              console.log(`✅ Created overdue reminder for payment: ${payment.id}`);
            }
          } catch (error) {
            console.error('❌ Error processing payment reminder:', error);
          }
        }

        console.log('✅ Payment reminders check completed');
      } catch (error) {
        console.error('❌ Error in payment reminders:', error);
      }
    };

    // Check reminders daily
    checkReminders();
    const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [payments, createReminder, createNotification]);

  return { createReminder };
}

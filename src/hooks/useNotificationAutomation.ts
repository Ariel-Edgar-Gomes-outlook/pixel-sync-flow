import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs } from './useJobs';
import { useLeads } from './useLeads';
import { usePayments } from './usePayments';
import { useResources } from './useResources';
import { differenceInDays, differenceInHours, parseISO } from 'date-fns';

export function useNotificationAutomation() {
  const queryClient = useQueryClient();
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();
  const { data: payments } = usePayments();
  const { data: resources } = useResources();

  // Create notification mutation using the system function
  const createNotification = useMutation({
    mutationFn: async (notification: {
      recipient_id: string;
      type: string;
      payload: any;
    }) => {
      const { error } = await supabase.rpc('create_system_notification', {
        _recipient_id: notification.recipient_id,
        _type: notification.type,
        _payload: notification.payload,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Check for automated notifications
  useEffect(() => {
    if (!jobs || !leads || !payments || !resources) return;

    const checkNotifications = async () => {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) return;

      const userId = currentUser.data.user.id;
      const now = new Date();

      // 1. Job starting in 24 hours
      for (const job of jobs) {
        const startDate = parseISO(job.start_datetime);
        const hoursUntil = differenceInHours(startDate, now);

        if (hoursUntil > 0 && hoursUntil <= 24) {
          // Check if notification already exists
          const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('recipient_id', userId)
            .eq('type', 'job_reminder')
            .filter('payload->>job_id', 'eq', job.id)
            .eq('read', false);

          if (!existing || existing.length === 0) {
            createNotification.mutate({
              recipient_id: userId,
              type: 'job_reminder',
              payload: {
                title: '🎬 Job começando em breve',
                message: `O job "${job.title}" começa em ${hoursUntil} horas`,
                job_id: job.id,
                priority: 'high',
              },
            });
          }
        }
      }

      // 2. Lead without follow-up for 3+ days
      for (const lead of leads) {
        if (lead.status === 'new' || lead.status === 'contacted') {
          const createdDate = parseISO(lead.created_at);
          const daysSince = differenceInDays(now, createdDate);

          if (daysSince >= 3) {
            // Check if notification already exists
            const { data: existing } = await supabase
              .from('notifications')
              .select('id')
              .eq('recipient_id', userId)
              .eq('type', 'lead_follow_up')
              .filter('payload->>lead_id', 'eq', lead.id)
              .eq('read', false);

            if (!existing || existing.length === 0) {
              createNotification.mutate({
                recipient_id: userId,
                type: 'lead_follow_up',
                payload: {
                  title: '⚠️ Lead sem follow-up',
                  message: `Lead de ${lead.clients?.name || 'Cliente'} há ${daysSince} dias sem contacto`,
                  lead_id: lead.id,
                  priority: 'medium',
                },
              });
            }
          }
        }
      }

      // 3. Overdue payments
      for (const payment of payments) {
        if (payment.status === 'pending' && payment.created_at) {
          const createdDate = parseISO(payment.created_at);
          const daysSince = differenceInDays(now, createdDate);

          if (daysSince >= 7) {
            // Check if notification already exists
            const { data: existing } = await supabase
              .from('notifications')
              .select('id')
              .eq('recipient_id', userId)
              .eq('type', 'payment_overdue')
              .filter('payload->>payment_id', 'eq', payment.id)
              .eq('read', false);

            if (!existing || existing.length === 0) {
              createNotification.mutate({
                recipient_id: userId,
                type: 'payment_overdue',
                payload: {
                  title: '💰 Pagamento atrasado',
                  message: `Pagamento de ${payment.clients?.name} vencido há ${daysSince} dias`,
                  payment_id: payment.id,
                  amount: payment.amount,
                  priority: 'high',
                },
              });
            }
          }
        }
      }

      // 4. Equipment maintenance due
      for (const resource of resources) {
        if (resource.next_maintenance_date) {
          const maintenanceDate = parseISO(resource.next_maintenance_date);
          const daysUntil = differenceInDays(maintenanceDate, now);

          if (daysUntil >= 0 && daysUntil <= 7) {
            // Check if notification already exists
            const { data: existing } = await supabase
              .from('notifications')
              .select('id')
              .eq('recipient_id', userId)
              .eq('type', 'maintenance_reminder')
              .filter('payload->>resource_id', 'eq', resource.id)
              .eq('read', false);

            if (!existing || existing.length === 0) {
              createNotification.mutate({
                recipient_id: userId,
                type: 'maintenance_reminder',
                payload: {
                  title: '🔧 Manutenção de equipamento',
                  message: `Manutenção de "${resource.name}" em ${daysUntil} dias`,
                  resource_id: resource.id,
                  priority: daysUntil <= 2 ? 'high' : 'medium',
                },
              });
            }
          }
        }
      }
    };

    // Check notifications on mount and every 6 hours (reduced frequency)
    checkNotifications();
    const interval = setInterval(checkNotifications, 6 * 60 * 60 * 1000); // Every 6 hours

    return () => clearInterval(interval);
  }, [jobs, leads, payments, resources]);

  return { createNotification };
}

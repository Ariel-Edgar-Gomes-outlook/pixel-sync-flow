import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs } from './useJobs';
import { useLeads } from './useLeads';
import { usePayments } from './usePayments';
import { useResources } from './useResources';
import { differenceInDays, differenceInHours, parseISO, addDays } from 'date-fns';

export function useNotificationAutomation() {
  const queryClient = useQueryClient();
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();
  const { data: payments } = usePayments();
  const { data: resources } = useResources();

  // Create notification mutation
  const createNotification = useMutation({
    mutationFn: async (notification: {
      recipient_id: string;
      type: string;
      payload: any;
    }) => {
      const { error } = await supabase
        .from('notifications')
        .insert(notification);

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
      jobs.forEach((job) => {
        const startDate = parseISO(job.start_datetime);
        const hoursUntil = differenceInHours(startDate, now);

        if (hoursUntil > 0 && hoursUntil <= 24) {
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
      });

      // 2. Lead without follow-up for 3+ days
      leads.forEach((lead) => {
        if (lead.status === 'new' || lead.status === 'contacted') {
          const createdDate = parseISO(lead.created_at);
          const daysSince = differenceInDays(now, createdDate);

          if (daysSince >= 3) {
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
      });

      // 3. Overdue payments
      payments.forEach((payment) => {
        if (payment.status === 'pending' && payment.created_at) {
          const createdDate = parseISO(payment.created_at);
          const daysSince = differenceInDays(now, createdDate);

          if (daysSince >= 7) {
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
      });

      // 4. Equipment maintenance due
      resources.forEach((resource) => {
        if (resource.next_maintenance_date) {
          const maintenanceDate = parseISO(resource.next_maintenance_date);
          const daysUntil = differenceInDays(maintenanceDate, now);

          if (daysUntil >= 0 && daysUntil <= 7) {
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
      });
    };

    // Check notifications on mount and every hour
    checkNotifications();
    const interval = setInterval(checkNotifications, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, [jobs, leads, payments, resources, createNotification]);

  return { createNotification };
}
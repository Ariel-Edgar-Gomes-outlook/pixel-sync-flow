import { useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs } from './useJobs';
import { useLeads } from './useLeads';
import { usePayments } from './usePayments';
import { useResources } from './useResources';
import { differenceInDays, differenceInHours, parseISO } from 'date-fns';

/**
 * FASE 3 REFATORADO: Automação de notificações com verificação de preferências
 * - Respeita notification_settings do usuário
 * - Intervalo otimizado para 1 hora
 * - Try-catch em todas as operações
 * - Logs detalhados para debugging
 */
export function useNotificationAutomation() {
  const queryClient = useQueryClient();
  const { data: jobs } = useJobs();
  const { data: leads } = useLeads();
  const { data: payments } = usePayments();
  const { data: resources } = useResources();

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
    if (!jobs || !leads || !payments || !resources) return;

    const checkNotifications = async () => {
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
          console.warn('⚠️ No notification settings found for user:', user.id);
          return;
        }

        console.log('🔔 Checking notifications with settings:', settings);

        const now = new Date();

        // AUTOMATION 1: Check for jobs starting within 24 hours
        if (settings.job_reminders) {
          for (const job of jobs) {
            try {
              if (!job.start_datetime) continue;

              const startDate = parseISO(job.start_datetime);
              const hoursUntil = differenceInHours(startDate, now);

              if (hoursUntil > 0 && hoursUntil <= 24) {
                // Check if notification already exists for this job (last 7 days)
                const { data: existing } = await supabase
                  .from('notifications')
                  .select('id')
                  .eq('type', 'job_reminder')
                  .eq('recipient_id', user.id)
                  .eq('read', false)
                  .contains('payload', { job_id: job.id })
                  .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
                  .maybeSingle();

                if (!existing) {
                  createNotification.mutate({
                    recipient_id: user.id,
                    type: 'job_reminder',
                    priority: 'high',
                    payload: {
                      title: '📅 Job Próximo',
                      message: `"${job.title}" começa em ${hoursUntil} horas`,
                      job_id: job.id,
                    },
                  });

                  console.log(`✅ Created job reminder for: ${job.title}`);
                }
              }
            } catch (error) {
              console.error('❌ Error processing job notification:', error);
            }
          }
        }

        // AUTOMATION 2: Check for leads that haven't been contacted in 3+ days
        if (settings.lead_follow_up) {
          for (const lead of leads) {
            try {
              if (lead.status === 'won' || lead.status === 'lost') continue;

              const createdDate = parseISO(lead.created_at);
              const daysSinceCreated = differenceInDays(now, createdDate);

              if (daysSinceCreated >= 3) {
                const { data: existing } = await supabase
                  .from('notifications')
                  .select('id')
                  .eq('type', 'lead_follow_up')
                  .eq('recipient_id', user.id)
                  .eq('read', false)
                  .contains('payload', { lead_id: lead.id })
                  .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
                  .maybeSingle();

                if (!existing) {
                  createNotification.mutate({
                    recipient_id: user.id,
                    type: 'lead_follow_up',
                    priority: 'medium',
                    payload: {
                      title: '🔔 Follow-up Necessário',
                      message: `Lead de ${lead.clients?.name} sem contacto há ${daysSinceCreated} dias`,
                      lead_id: lead.id,
                    },
                  });

                  console.log(`✅ Created follow-up reminder for lead: ${lead.clients?.name}`);
                }
              }
            } catch (error) {
              console.error('❌ Error processing lead notification:', error);
            }
          }
        }

        // AUTOMATION 3: Check for overdue payments
        if (settings.payment_overdue) {
          for (const payment of payments) {
            try {
              if (payment.status !== 'pending') continue;

              const createdDate = parseISO(payment.created_at);
              const daysOld = differenceInDays(now, createdDate);

              if (daysOld >= 7) {
                const { data: existing } = await supabase
                  .from('notifications')
                  .select('id')
                  .eq('type', 'payment_overdue')
                  .eq('recipient_id', user.id)
                  .eq('read', false)
                  .contains('payload', { payment_id: payment.id })
                  .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
                  .maybeSingle();

                if (!existing) {
                  createNotification.mutate({
                    recipient_id: user.id,
                    type: 'payment_overdue',
                    priority: 'high',
                    payload: {
                      title: '💰 Pagamento Atrasado',
                      message: `Pagamento de ${payment.clients?.name} pendente há ${daysOld} dias`,
                      payment_id: payment.id,
                    },
                  });

                  console.log(`✅ Created overdue payment notification for: ${payment.clients?.name}`);
                }
              }
            } catch (error) {
              console.error('❌ Error processing payment notification:', error);
            }
          }
        }

        // AUTOMATION 4: Check for upcoming equipment maintenance
        if (settings.maintenance_reminder) {
          for (const resource of resources) {
            try {
              if (!resource.next_maintenance_date) continue;

              const maintenanceDate = parseISO(resource.next_maintenance_date);
              const daysUntil = differenceInDays(maintenanceDate, now);

              if (daysUntil >= 0 && daysUntil <= 7) {
                const { data: existing } = await supabase
                  .from('notifications')
                  .select('id')
                  .eq('type', 'maintenance_reminder')
                  .eq('recipient_id', user.id)
                  .eq('read', false)
                  .contains('payload', { resource_id: resource.id })
                  .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
                  .maybeSingle();

                if (!existing) {
                  createNotification.mutate({
                    recipient_id: user.id,
                    type: 'maintenance_reminder',
                    priority: 'medium',
                    payload: {
                      title: '🔧 Manutenção Próxima',
                      message: `${resource.name} requer manutenção em ${daysUntil} dias`,
                      resource_id: resource.id,
                    },
                  });

                  console.log(`✅ Created maintenance reminder for: ${resource.name}`);
                }
              }
            } catch (error) {
              console.error('❌ Error processing maintenance notification:', error);
            }
          }
        }

        console.log('✅ Notification check completed');
      } catch (error) {
        console.error('❌ Error in notification automation:', error);
      }
    };

    // Check notifications every 6 hours (changed from 1 hour to prevent spam)
    checkNotifications();
    const interval = setInterval(checkNotifications, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [jobs, leads, payments, resources]); // REMOVED createNotification from deps to prevent infinite loop

  return { createNotification };
}

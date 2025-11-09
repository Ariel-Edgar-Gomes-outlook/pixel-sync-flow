import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';
import { differenceInDays, differenceInHours, parseISO } from 'https://esm.sh/date-fns@3.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationToCreate {
  recipient_id: string;
  type: string;
  payload: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Cooldown periods for each notification type (in hours)
const COOLDOWN_PERIODS: Record<string, number> = {
  job_reminder: 24,        // Once per day per job
  lead_follow_up: 72,      // Once every 3 days per lead
  payment_overdue: 168,    // Once per week per payment
  maintenance_reminder: 168, // Once per week per resource
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('🔔 Starting notification check for user:', user.id);

    // Get user notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError || !settings) {
      console.log('⚠️ No notification settings found');
      return new Response(
        JSON.stringify({ success: true, created: 0, message: 'No settings found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notificationsToCreate: NotificationToCreate[] = [];
    const now = new Date();

    // Helper function to check if notification already exists within cooldown period
    async function shouldCreateNotification(
      type: string,
      entityId: string,
      entityIdKey: string
    ): Promise<boolean> {
      if (!user) return false; // Safety check
      
      const cooldownHours = COOLDOWN_PERIODS[type] || 24;
      const cooldownDate = new Date(now.getTime() - cooldownHours * 60 * 60 * 1000);

      const { data: existing } = await supabase
        .from('notifications')
        .select('id, created_at')
        .eq('type', type)
        .eq('recipient_id', user.id)
        .contains('payload', { [entityIdKey]: entityId })
        .gte('created_at', cooldownDate.toISOString())
        .limit(1)
        .maybeSingle();

      return !existing; // Create only if no recent notification exists
    }

    // 1. Check job reminders (jobs starting in 12-24 hours)
    if (settings.job_reminders) {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by', user.id)
        .gte('start_datetime', now.toISOString())
        .lte('start_datetime', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());

      if (jobs) {
        for (const job of jobs) {
          const startDate = parseISO(job.start_datetime);
          const hoursUntil = differenceInHours(startDate, now);

          // Only notify for jobs 12-24 hours away
          if (hoursUntil >= 12 && hoursUntil <= 24) {
            const shouldCreate = await shouldCreateNotification('job_reminder', job.id, 'job_id');
            
            if (shouldCreate) {
              notificationsToCreate.push({
                recipient_id: user.id,
                type: 'job_reminder',
                priority: 'high',
                payload: {
                  title: '📅 Job Próximo',
                  message: `"${job.title}" começa em ${hoursUntil} horas`,
                  job_id: job.id,
                },
              });
              console.log(`✅ Queued job reminder: ${job.title}`);
            }
          }
        }
      }
    }

    // 2. Check lead follow-ups (leads without contact for 3+ days)
    if (settings.lead_follow_up) {
      const { data: leads } = await supabase
        .from('leads')
        .select('*, clients(*)')
        .in('status', ['new', 'contacted', 'qualified'])
        .lte('created_at', new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString());

      if (leads) {
        for (const lead of leads) {
          const createdDate = parseISO(lead.created_at);
          const daysSince = differenceInDays(now, createdDate);

          if (daysSince >= 3) {
            const shouldCreate = await shouldCreateNotification('lead_follow_up', lead.id, 'lead_id');
            
            if (shouldCreate) {
              notificationsToCreate.push({
                recipient_id: user.id,
                type: 'lead_follow_up',
                priority: daysSince >= 7 ? 'high' : 'medium',
                payload: {
                  title: '🔔 Follow-up Necessário',
                  message: `Lead de ${lead.clients?.name || 'Cliente'} sem contacto há ${daysSince} dias`,
                  lead_id: lead.id,
                },
              });
              console.log(`✅ Queued lead follow-up: ${lead.clients?.name}`);
            }
          }
        }
      }
    }

    // 3. Check overdue payments (pending for 7+ days)
    if (settings.payment_overdue) {
      const { data: payments } = await supabase
        .from('payments')
        .select('*, clients(*)')
        .eq('status', 'pending')
        .eq('created_by', user.id)
        .lte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (payments) {
        for (const payment of payments) {
          const createdDate = parseISO(payment.created_at);
          const daysOld = differenceInDays(now, createdDate);

          if (daysOld >= 7) {
            const shouldCreate = await shouldCreateNotification('payment_overdue', payment.id, 'payment_id');
            
            if (shouldCreate) {
              notificationsToCreate.push({
                recipient_id: user.id,
                type: 'payment_overdue',
                priority: daysOld >= 14 ? 'urgent' : 'high',
                payload: {
                  title: '💰 Pagamento Atrasado',
                  message: `Pagamento de ${payment.clients?.name || 'Cliente'} pendente há ${daysOld} dias`,
                  payment_id: payment.id,
                },
              });
              console.log(`✅ Queued payment overdue: ${payment.clients?.name}`);
            }
          }
        }
      }
    }

    // 4. Check maintenance reminders (due in 0-7 days)
    if (settings.maintenance_reminder) {
      const { data: resources } = await supabase
        .from('resources')
        .select('*')
        .eq('created_by', user.id)
        .not('next_maintenance_date', 'is', null)
        .gte('next_maintenance_date', now.toISOString().split('T')[0])
        .lte('next_maintenance_date', new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (resources) {
        for (const resource of resources) {
          const maintenanceDate = parseISO(resource.next_maintenance_date);
          const daysUntil = differenceInDays(maintenanceDate, now);

          if (daysUntil >= 0 && daysUntil <= 7) {
            const shouldCreate = await shouldCreateNotification('maintenance_reminder', resource.id, 'resource_id');
            
            if (shouldCreate) {
              notificationsToCreate.push({
                recipient_id: user.id,
                type: 'maintenance_reminder',
                priority: daysUntil <= 2 ? 'high' : 'medium',
                payload: {
                  title: '🔧 Manutenção Próxima',
                  message: `${resource.name} requer manutenção em ${daysUntil} dias`,
                  resource_id: resource.id,
                },
              });
              console.log(`✅ Queued maintenance reminder: ${resource.name}`);
            }
          }
        }
      }
    }

    // Create all queued notifications using RPC
    let createdCount = 0;
    for (const notification of notificationsToCreate) {
      try {
        const { data, error } = await supabase.rpc('create_system_notification', {
          _recipient_id: notification.recipient_id,
          _type: notification.type,
          _payload: notification.payload,
        });

        if (!error && data) {
          // Update priority
          await supabase
            .from('notifications')
            .update({ priority: notification.priority })
            .eq('id', data);
          
          createdCount++;
        }
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    console.log(`✅ Created ${createdCount} notifications`);
    
    // Note: Email notifications are sent automatically via database trigger

    return new Response(
      JSON.stringify({ 
        success: true, 
        created: createdCount,
        checked: notificationsToCreate.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in check-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

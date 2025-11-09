import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';

/**
 * Hook que escuta notificações em tempo real e as exibe como notificações push
 */
export function useRealtimePushNotifications() {
  const { user } = useAuth();
  const { isEnabled, showNotification } = usePushNotifications();

  useEffect(() => {
    if (!user || !isEnabled) return;

    console.log('🔔 Iniciando escuta de notificações push em tempo real...');

    // Subscrever a mudanças na tabela de notificações
    const channel = supabase
      .channel('push-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('📬 Nova notificação recebida:', payload.new);
          
          const notification = payload.new as any;
          
          // Mapear ícones por tipo de notificação
          const iconMap: Record<string, string> = {
            job_reminder: '📅',
            lead_follow_up: '📞',
            payment_overdue: '💰',
            maintenance_reminder: '🔧',
            new_lead: '🎯',
            job_completed: '✅',
          };

          const icon = iconMap[notification.type] || '🔔';
          const title = notification.payload?.title || 'Nova Notificação';
          const body = notification.payload?.message || 'Você tem uma nova notificação';

          // Mostrar notificação push
          showNotification({
            title: `${icon} ${title}`,
            body: body,
            tag: notification.id,
            data: {
              notificationId: notification.id,
              type: notification.type,
              payload: notification.payload,
            },
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da subscrição:', status);
      });

    // Cleanup ao desmontar
    return () => {
      console.log('🔇 Removendo escuta de notificações push');
      supabase.removeChannel(channel);
    };
  }, [user, isEnabled, showNotification]);

  return null;
}

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { playNotificationSound, getNotificationSoundType } from '@/lib/notificationSounds';

export function useBrowserNotifications(soundEnabled: boolean = true) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notificações ativadas com sucesso!');
        return true;
      } else if (result === 'denied') {
        toast.error('Permissão para notificações negada');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erro ao solicitar permissão');
      return false;
    }
  };

  const showNotification = useCallback((title: string, options?: NotificationOptions, notificationType?: string) => {
    if (permission !== 'granted') {
      console.log('Cannot show notification: permission not granted');
      return;
    }

    // Play sound if enabled
    if (soundEnabled && notificationType) {
      const soundType = getNotificationSoundType(notificationType);
      playNotificationSound(soundType);
    }

    // Check if the page is in focus
    if (document.hasFocus()) {
      // Don't show browser notification if user is on the page, but still play sound
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options,
      });

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission, soundEnabled]);

  useEffect(() => {
    if (!user || permission !== 'granted') return;

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any;
          
          // Show browser notification with sound
          showNotification(
            getNotificationTitle(notification.type),
            {
              body: notification.payload?.message || 'Nova notificação',
              tag: notification.id,
              requireInteraction: false,
            },
            notification.type // Pass notification type for sound
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, permission, showNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
}

// Helper function to get notification title
function getNotificationTitle(type: string): string {
  const titleMap: Record<string, string> = {
    payment_overdue: '💳 Pagamento Vencido',
    invoice_overdue: '🧾 Fatura Vencida',
    job_reminder: '📸 Lembrete de Job',
    contract_pending: '📝 Contrato Pendente',
    quote_sent: '💼 Orçamento Enviado',
    delivery_ready: '📦 Entrega Pronta',
    lead_follow_up: '📞 Follow-up de Lead',
    new_lead: '🆕 Novo Lead',
    contract_signed: '✅ Contrato Assinado',
    maintenance_due: '🔧 Manutenção Pendente',
    job_completed: '✨ Job Concluído',
  };
  
  return titleMap[type] || 'Nova Notificação';
}

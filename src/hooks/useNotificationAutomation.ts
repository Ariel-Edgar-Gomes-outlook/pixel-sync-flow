import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Sistema de notificações automáticas reimplementado
 * - Usa edge function para processamento controlado
 * - Verifica a cada 3 horas (ao invés de continuamente)
 * - Detecção robusta de duplicatas com cooldown
 */
export function useNotificationAutomation() {
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        console.log('🔔 Triggering notification check...');
        
        const { data, error } = await supabase.functions.invoke('check-notifications', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          console.error('❌ Notification check error:', error);
        } else {
          console.log('✅ Notification check completed:', data);
        }
      } catch (error) {
        console.error('❌ Notification automation error:', error);
      }
    };

    // Check immediately on mount
    checkNotifications();

    // Check every 3 hours (optimized interval)
    const interval = setInterval(checkNotifications, 3 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

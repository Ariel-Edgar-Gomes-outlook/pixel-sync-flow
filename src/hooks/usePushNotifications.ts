import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verificar se notificações são suportadas
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      
      // Registrar Service Worker
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('✅ Service Worker registrado:', reg);
      setRegistration(reg);

      // Aguardar o Service Worker estar ativo
      if (reg.installing) {
        console.log('Service Worker: Instalando...');
      } else if (reg.waiting) {
        console.log('Service Worker: Aguardando...');
      } else if (reg.active) {
        console.log('Service Worker: Ativo');
      }
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notificações não suportadas', {
        description: 'Seu navegador não suporta notificações push.',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notificações ativadas!', {
          description: 'Você receberá notificações do sistema.',
        });
        return true;
      } else if (result === 'denied') {
        toast.error('Permissão negada', {
          description: 'Você negou permissão para notificações. Altere nas configurações do navegador.',
        });
        return false;
      } else {
        toast.info('Permissão não concedida', {
          description: 'Você pode ativar notificações depois nas configurações.',
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão para notificações');
      return false;
    }
  };

  const showNotification = async (options: NotificationOptions): Promise<void> => {
    if (!isSupported) {
      console.warn('Notificações não suportadas');
      return;
    }

    if (permission !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return;
    }

    if (!registration) {
      console.warn('Service Worker não registrado');
      return;
    }

    try {
      // Enviar mensagem para o Service Worker mostrar a notificação
      if (registration.active) {
        registration.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          notification: {
            title: options.title,
            body: options.body,
            icon: options.icon || '/favicon.png',
            badge: options.badge || '/favicon-32x32.png',
            tag: options.tag || `notification-${Date.now()}`,
            data: options.data || {},
          },
        });

        console.log('✅ Notificação enviada:', options.title);
      }
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação:', error);
    }
  };

  const isEnabled = permission === 'granted';

  return {
    isSupported,
    permission,
    isEnabled,
    requestPermission,
    showNotification,
  };
}

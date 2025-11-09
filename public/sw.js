// Service Worker para notificações push
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativado');
  event.waitUntil(self.clients.claim());
});

// Escutar mensagens do cliente para mostrar notificações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge, tag, data } = event.data.notification;
    
    const options = {
      body,
      icon: icon || '/favicon.png',
      badge: badge || '/favicon-32x32.png',
      tag: tag || 'default',
      data: data || {},
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false,
    };

    self.registration.showNotification(title, options);
  }
});

// Lidar com cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event.notification.tag);
  event.notification.close();

  // Abrir ou focar na janela da aplicação
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já existe uma janela aberta, focar nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Caso contrário, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow('/notifications');
      }
    })
  );
});

// Lidar com fechamento de notificações
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada:', event.notification.tag);
});

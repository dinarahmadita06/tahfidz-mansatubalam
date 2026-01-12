self.addEventListener('push', function (event) {
  if (!event.data) return;

  let data;
  try {
    // Try to parse JSON
    data = event.data.json();
  } catch (e) {
    // Fallback to text if JSON fails (e.g. from DevTools)
    data = {
      title: 'SIMTAQ',
      body: event.data.text() || 'Notifikasi baru'
    };
  }

  const options = {
    body: data.body || 'Notifikasi baru',
    icon: data.icon || '/logo-man1.png',
    badge: data.badge || '/logo-man1.png',
    data: {
      url: data.url || data.data?.url || '/pengumuman'
    },
    vibrate: [100, 50, 100],
    tag: 'announcement-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SIMTAQ', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

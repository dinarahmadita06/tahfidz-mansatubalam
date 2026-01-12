/* sw.js */

self.addEventListener('push', function (event) {
  // Default fallback supaya push tanpa payload (DevTools) tetap muncul
  let data = {
    title: 'SIMTAQ',
    body: 'Notifikasi baru',
    url: '/pengumuman',
    icon: '/logo-man1.png',
    badge: '/logo-man1.png',
  };

  if (event.data) {
    try {
      const json = event.data.json();
      data = {
        ...data,
        ...json,
        icon: json.icon || data.icon,
        badge: json.badge || data.badge,
        url: json.url || json.data?.url || data.url,
      };
    } catch (e) {
      // DevTools sering kirim plain text
      const text = event.data.text ? event.data.text() : '';
      data = {
        ...data,
        body: text || data.body,
      };
    }
  }

  const title = data.title || 'SIMTAQ';

  const options = {
    body: data.body || 'Notifikasi baru',
    icon: data.icon || '/logo-man1.png',
    badge: data.badge || '/logo-man1.png',
    data: {
      url: data.url || '/pengumuman',
    },
    vibrate: [100, 50, 100],
    tag: 'announcement-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const rawUrl = event.notification?.data?.url || '/';
  const urlToOpen = new URL(rawUrl, self.location.origin).toString();

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          // Fokuskan jika sudah ada tab di URL yang sama
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }

        return undefined;
      })
  );
});

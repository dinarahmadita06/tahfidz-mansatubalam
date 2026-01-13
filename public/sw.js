/* sw.js */

self.addEventListener('push', function (event) {
  event.waitUntil((async () => {
    // 1. Default payload
    let data = {
      title: 'SIMTAQ',
      body: 'Notifikasi baru',
      url: '/pengumuman',
      icon: '/logo-man1.png',
      badge: '/logo-man1.png',
    };

    // 2. Try to extract data from push event
    if (event.data) {
      try {
        // Try parsing as JSON first
        const json = event.data.json();
        if (json && typeof json === 'object') {
          data = {
            ...data,
            ...json,
            // Deep merge some important fields
            url: json.url || json.data?.url || data.url,
            id: json.id || json.data?.id || null
          };
        }
      } catch (e) {
        // Fallback to text (common for DevTools testing)
        try {
          const text = event.data.text();
          if (text) data.body = text;
        } catch (textErr) {
          console.error('Error reading push text:', textErr);
        }
      }
    }

    // 3. Set unique tag to prevent overwriting different notifications
    const notificationTag = data.id ? `pengumuman-${data.id}` : `push-${Date.now()}`;

    // 4. Show the notification
    return self.registration.showNotification(data.title || 'SIMTAQ', {
      body: data.body || 'Notifikasi baru',
      icon: data.icon || '/logo-man1.png',
      badge: data.badge || '/logo-man1.png',
      data: {
        url: data.url || '/pengumuman',
      },
      vibrate: [100, 50, 100],
      tag: notificationTag,
      renotify: true,
    });
  })());
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const rawUrl = event.notification?.data?.url || '/';
  const urlToOpen = new URL(rawUrl, self.location.origin).toString();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
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

/* sw.js */

self.addEventListener('push', function (event) {
  event.waitUntil((async () => {
    // 1. Default payload
    let data = {
      title: 'SIMTAQ',
      body: 'Pengumuman baru',
      url: '/pengumuman',
      icon: '/logo-man1.png',
      badge: '/logo-man1.png',
      id: null
    };

    // 2. Try to extract data from push event
    if (event.data) {
      try {
        const json = event.data.json();
        if (json && typeof json === 'object') {
          data = {
            ...data,
            ...json,
            // Ensure fields are extracted correctly from top level or nested data
            url: json.url || json.data?.url || data.url,
            id: json.id || json.data?.id || data.id
          };
        }
      } catch (e) {
        try {
          // Async text extraction (handled within the promise chain)
          const text = await event.data.text();
          if (text) data.body = text;
        } catch (textErr) {
          console.error('Error reading push text:', textErr);
        }
      }
    }

    // 3. Optimized Notification Options
    const notificationTag = data.id ? `announcement-${data.id}` : `push-${Date.now()}`;

    return self.registration.showNotification(data.title || 'SIMTAQ', {
      body: data.body || 'Pengumuman baru',
      icon: data.icon || '/logo-man1.png',
      badge: data.badge || '/logo-man1.png',
      data: {
        url: data.url || '/pengumuman',
      },
      vibrate: [200, 100, 200, 100, 200],
      tag: notificationTag,
      renotify: true,
      silent: false,
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Buka' },
        { action: 'dismiss', title: 'Tutup' }
      ]
    });
  })());
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  // Handle Action Buttons
  if (event.action === 'dismiss') {
    return;
  }

  // Handle Open
  const rawUrl = event.notification?.data?.url || '/pengumuman';
  const urlToOpen = new URL(rawUrl, self.location.origin).toString();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // 1. If a window is already open at this URL, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // 2. Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

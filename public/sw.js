self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  event.waitUntil((async () => {
    let data = {};
    try {
      data = event.data.json();
    } catch {
      // DevTools payload sering plain text
      const text = await event.data.text();
      data = { title: 'SIMTAQ', body: text || 'Notifikasi baru' };
    }

    const title = data.title || 'SIMTAQ';
    const url = data.url || data?.data?.url || '/pengumuman';

    const fullUrl = new URL(url, self.location.origin).toString();

    const options = {
      body: data.body || 'Notifikasi baru',
      icon: data.icon || '/logo-man1.png',
      badge: data.badge || '/logo-man1.png',
      data: { url: fullUrl },
      vibrate: [100, 50, 100],
      tag: 'announcement-notification',
      renotify: true
    };

    await self.registration.showNotification(title, options);
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil((async () => {
    const urlToOpen = event.notification?.data?.url || self.location.origin + '/';

    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // Fokuskan tab yang origin-nya sama
    for (const client of clientList) {
      if (client.url && new URL(client.url).origin === new URL(urlToOpen).origin) {
        if ('focus' in client) {
          await client.focus();
          // navigasi ke target URL (lebih reliable)
          if ('navigate' in client) return client.navigate(urlToOpen);
          return;
        }
      }
    }

    if (clients.openWindow) return clients.openWindow(urlToOpen);
  })());
});

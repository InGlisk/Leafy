// Leafy Service Worker
const CACHE_NAME = 'leafy-v1';
const STATIC_ASSETS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'Leafy';
  const options = {
    body: data.body ?? 'Time to check your plants!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url ?? '/' },
    actions: [
      { action: 'done', title: '✅ Mark done' },
      { action: 'snooze', title: '⏰ Remind tomorrow' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'done') {
    // POST to log the care action
    const url = event.notification.data?.url ?? '/';
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        const client = clients.find((c) => c.url === url);
        if (client) client.focus();
        else self.clients.openWindow(url);
      })
    );
  } else {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url ?? '/')
    );
  }
});

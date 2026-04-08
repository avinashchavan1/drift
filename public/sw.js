const CACHE_NAME = 'drift-v1';

// ── Install: cache shell assets ────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// ── Push: show notification ────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); } catch (e) { data = { title: 'Drift', body: event.data.text() }; }

  const title   = data.title || 'Drift';
  const options = {
    body:    data.body   || '',
    icon:    '/icon-192.png',
    badge:   '/badge-72.png',
    tag:     data.type   || 'drift',
    renotify: true,
    data:    { url: data.url || '/' },
    actions: [
      { action: 'open',    title: 'Open Drift' },
      { action: 'dismiss', title: 'Dismiss'    },
    ],
    // Rich vibration pattern for mobile
    vibrate: [100, 50, 100],
  };

  // Style per notification type
  if (data.type === 'due_soon')     options.icon = '/icon-due.png';
  if (data.type === 'overdue')      options.icon = '/icon-overdue.png';
  if (data.type === 'daily_digest') options.icon = '/icon-digest.png';

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── Notification click ─────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If app is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetUrl });
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(targetUrl);
    })
  );
});

// ── Push subscription change ───────────────────────────────
self.addEventListener('pushsubscriptionchange', event => {
  // Resubscribe automatically when subscription expires
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then(sub => {
        // Notify all clients to re-register the subscription
        clients.matchAll().then(cls =>
          cls.forEach(c => c.postMessage({ type: 'SUBSCRIPTION_CHANGED', subscription: sub.toJSON() }))
        );
      })
  );
});

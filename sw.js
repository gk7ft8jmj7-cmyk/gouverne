// Gouverne : cache hors ligne (réseau d'abord) + notifications push
const C = 'gouverne-v2';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']))); });
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (_) { d = { title:'Gouverne', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Gouverne', { body:d.body || '', icon:'icon-192.png', badge:'icon-192.png', tag:d.tag || undefined, renotify:!!d.tag, data:{ url:d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(ws => { for (const w of ws) if (w.url.startsWith(self.registration.scope)) return w.focus(); return self.clients.openWindow(url); }));
});

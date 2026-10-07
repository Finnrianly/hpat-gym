// Offline cache for HPAT Gym. Bump VERSION on every deploy so phones pick up the new files.
const VERSION = "hpat-gym-v1.0.0";
const FILES = [
  "./", "index.html", "styles.css", "app.js", "questions.js", "lessons.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "fonts/atkinson-400.woff2", "fonts/atkinson-700.woff2", "fonts/bricolage-600.woff2",
  "fonts/bricolage-800.woff2", "fonts/jbmono-500.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match("index.html")))
  );
});

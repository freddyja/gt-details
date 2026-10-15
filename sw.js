const CACHE_NAME = "gt-details-v3";
const APP_SHELL = ["./","./index.html","./styles.css","./data.js","./i18n.js","./app.js","./manifest.webmanifest","./icons/gt-180.png","./icons/gt-192.png","./icons/gt-512.png","./icons/logo.svg"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then((res) => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE_NAME).then((ca) => ca.put(r, c)); } return res; })
    .catch(() => caches.match(r).then((m) => m || (r.mode === "navigate" ? caches.match("./index.html") : undefined))));
});

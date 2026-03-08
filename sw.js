// Fab News PWA — Service Worker
const CACHE_NAME = "fab-news-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap",
];

// ── INSTALL: Cache static assets ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(
        STATIC_ASSETS.map((url) => new Request(url, { mode: "no-cors" })),
      );
    }),
  );
  self.skipWaiting();
});

// ── ACTIVATE: Clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// ── FETCH: Network first, cache fallback ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") return;

  // For API calls: network only (no caching of live news data here)
  if (
    url.hostname.includes("gnews.io") ||
    url.hostname.includes("newsapi.org")
  ) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ articles: [], error: "offline" }), {
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    return;
  }

  // For fonts and static assets: stale-while-revalidate
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request).then((res) => {
            cache.put(request, res.clone());
            return res;
          });
          return cached || network;
        }),
      ),
    );
    return;
  }

  // For page requests: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        return res;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match("/index.html")),
      ),
  );
});

// ── BACKGROUND SYNC (optional) ──
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-news") {
    // Background refresh logic can go here
    console.log("[SW] Background sync triggered");
  }
});

// ── PUSH NOTIFICATIONS (optional) ──
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "Fab News", {
    body: data.body || "Breaking news available",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "fab-news",
    renotify: true,
    data: { url: data.url || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data?.url || "/";
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});

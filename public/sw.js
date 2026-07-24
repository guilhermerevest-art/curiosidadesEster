// Curioso Service Worker
// Estratégia:
//  - HTML: network-first com fallback para cache (offline)
//  - JS/CSS/imagens do app: cache-first (rápido, garante offline)
//  - Imagens externas (Wikimedia): stale-while-revalidate

const CACHE = "curioso-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.json", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // HTML / navegação: network-first
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // imagens externas: stale-while-revalidate
  if (url.hostname.endsWith("wikimedia.org") || url.hostname.endsWith("wikipedia.org")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone()).catch(() => {});
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  // assets do app: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok && (url.origin === location.origin)) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match("/"));
    }),
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  let payload = { title: "Curioso", body: "Sua curiosidade de hoje está pronta." };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    // silencioso
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: { url: payload.url ?? "/" },
      tag: "curioso-daily",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (clients) => {
      for (const c of clients) {
        if ("focus" in c) {
          await c.focus();
          c.navigate?.(url);
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(url);
    }),
  );
});

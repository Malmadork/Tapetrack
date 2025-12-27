const STATIC_CACHE_NAME = "app-static-v1";
const DYNAMIC_CACHE_NAME = "app-dynamic-v1";

const STATIC_ASSETS = [
  "/offline",
  "/css/albumView.css",
  "/css/home.css",
  "/css/nav.css",
  "/css/styles.css",
  "/images/icon/android-chrome-192x192.png",
  "/images/icon/android-chrome-512x512.png",
  "/images/icon/apple-touch-icon.png",
  "/images/icon/favicon-16x16.png",
  "/images/icon/favicon-32x32.png",
  "/images/icon/favicon.ico",
  "/images/placeholder.png",
  "/images/tapetrack-160x160.png",
  "/images/tapetrack-160x160.svg",
  "/js/mobilenav/home.js",
  "/js/mobilenav/search.js",
  "/js/APIClient.js",
  "/js/auth.js",
  "/js/common.js",
  "/js/HTTPClient.js",
  "/js/renderAlbums.js",
  "/js/renderAlbumView.js",
];

function log(...args) {
  console.log("SW:", ...args);
}

// -------------------- Install --------------------
self.addEventListener("install", event => {
  log("install");
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => console.error("SW install cache error:", err))
  );
  self.skipWaiting();
});

// -------------------- Activate --------------------
self.addEventListener("activate", event => {
  log("activate");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// -------------------- Fetch --------------------
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Offline fallback for navigation
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline"))
    );
    return;
  }

  // Cache-first for static assets
  if (url.origin === location.origin && url.pathname.match(/\.(css|js|png|svg|ico|jpg|jpeg|webp)$/)) {
    event.respondWith(
      caches.match(request).then(cacheRes => cacheRes || fetchAndCache(request))
    );
    return;
  }

  // Network-first for API requests
  if (url.pathname.startsWith("/api")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default network-first
  event.respondWith(networkFirst(request));
});

// -------------------- Cache Strategies --------------------
function cacheFirst(request) {
  return caches.match(request).then(response => response || fetchAndCache(request))
    .catch(() => caches.match("/offline"));
}

function networkFirst(request) {
  return fetchAndCache(request).catch(() => caches.match(request))
    .catch(() => caches.match("/offline"));
}

function fetchAndCache(request) {
    return fetch(request)
        .then(response => {
            if (!response.ok) {
                return response;
            }

            if (request.method === "GET") {
                return response.clone().json()
                    .then(data => {
                        return caches.open(DYNAMIC_CACHE_NAME)
                            .then(cache => cache.put(request, new Response(JSON.stringify(data))))
                            .then(() => response);
                    })
                    .catch(() => response);
            }
            return response;
        })
        .catch(() => {
            return caches.match(request)
                .then(cached => cached || caches.match("/offline"));
        });
}





// -------------------- Messages --------------------
self.addEventListener("message", event => {
  log("message", event.data);
  if (event.data?.action === "skipWaiting") {
    self.skipWaiting();
  }
});

// -------------------- Push Notifications --------------------
self.addEventListener("push", event => {
  log("push", event);
  const message = event.data.json();
  event.waitUntil(
    clients.matchAll().then(clientsArr => {
      if (clientsArr.length === 0) {
        return self.registration.showNotification(message.title, {
          body: message.body,
          icon: '/images/icon/favicon-32x32.png'
        });
      }
    })
  );
});

self.addEventListener("notificationclick", event => {
  log("notificationclick", event);
  event.notification.close();
  event.waitUntil(
    clients.openWindow(self.location.origin)
  );
});

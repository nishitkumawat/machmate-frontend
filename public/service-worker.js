const CACHE_NAME = "machmate-cache-v2"; // bump version when updating
const urlsToCache = [
  "/index.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.png",
];

// Install event: cache core assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn("Failed to pre-cache some assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: try network first, fallback to cache, then fallback to index.html
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Optionally cache successful GET requests
        if (event.request.method === "GET") {
          const cloned = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Offline SPA fallback
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      })
  );
});

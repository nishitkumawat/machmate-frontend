const CACHE_NAME = "machmate-cache-v2"; // bump version when updating
const urlsToCache = [
  "/index.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.png",
  "/assets/", // optional: cache static assets folder
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

// Fetch event: network first for API, cache static assets only
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 🚫 Don't cache API requests
  if (requestUrl.origin === "https://machmate-backend.onrender.com") {
    event.respondWith(
      fetch(event.request, { credentials: "include" }).catch(() => {
        return new Response(JSON.stringify({ error: "API not reachable" }), {
          headers: { "Content-Type": "application/json" },
        });
      })
    );
    return; // exit early
  }

  // Static assets & SPA fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache GET requests for static assets only
        if (
          event.request.method === "GET" &&
          !event.request.url.includes("/api/") &&
          !event.request.url.includes("/auth/")
        ) {
          const cloned = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // Offline SPA fallback
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }

        return new Response("Offline content not available", { status: 503 });
      })
  );
});

const CACHE_NAME = "machmate-cache-v3"; // update version on new deploy
const urlsToCache = [
  "/index.html",
  "/favicon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/assets/", // optional: static assets folder
];

// ----------------------------
// Install event: cache core assets
// ----------------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn("[SW] Failed to pre-cache some assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// ----------------------------
// Activate event: clean old caches
// ----------------------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ----------------------------
// Fetch event: network-first for API/auth, cache static assets
// ----------------------------
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // --- 1️⃣ Network-only for API/auth requests ---
  if (
    requestUrl.origin === "https://machmate-backend.onrender.com" &&
    (requestUrl.pathname.startsWith("/auth/") ||
      requestUrl.pathname.startsWith("/api/"))
  ) {
    event.respondWith(
      fetch(event.request, { credentials: "include" }).catch(() => {
        return new Response(JSON.stringify({ error: "API not reachable" }), {
          headers: { "Content-Type": "application/json" },
        });
      })
    );
    return; // exit early
  }

  // --- 2️⃣ Static assets & SPA navigation fallback ---
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

        // SPA fallback for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }

        return new Response("Offline content not available", { status: 503 });
      })
  );
});

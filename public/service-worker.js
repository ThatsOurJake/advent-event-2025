const CACHE_NAME = "image-cache-v1";
const CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

const installEvent = () => {
  self.addEventListener("install", () => {
    console.log("service worker installed");
    self.skipWaiting();
  });
};

installEvent();

const activateEvent = () => {
  self.addEventListener("activate", (event) => {
    console.log("service worker activated");
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== CACHE_NAME) {
                return caches.delete(cacheName);
              }
              return Promise.resolve();
            }),
          );
        })
        .then(() => self.clients.claim()),
    );
  });
};

activateEvent();

const fetchEvent = () => {
  self.addEventListener("fetch", (event) => {
    const { request } = event;
    const { destination } = request;

    if (destination === "image") {
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              const cachedDate = cachedResponse.headers.get("sw-cached-date");
              if (cachedDate) {
                const cacheAge = Date.now() - new Date(cachedDate).getTime();
                if (cacheAge < CACHE_DURATION) {
                  return cachedResponse;
                }
              }
            }

            return fetch(request)
              .then((response) => {
                if (response.ok) {
                  const responseToCache = response.clone();
                  const headers = new Headers(responseToCache.headers);
                  headers.set("sw-cached-date", new Date().toISOString());

                  return responseToCache.blob().then((blob) => {
                    const newResponse = new Response(blob, {
                      status: responseToCache.status,
                      statusText: responseToCache.statusText,
                      headers: headers,
                    });
                    cache.put(request, newResponse);
                    return response;
                  });
                }
                return response;
              })
              .catch(() => {
                return (
                  cachedResponse ||
                  new Response("Network error", { status: 408 })
                );
              });
          });
        }),
      );
    }
  });
};

fetchEvent();

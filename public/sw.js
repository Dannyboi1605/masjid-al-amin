// Bump this version when the offline page, icons, or cached shell change.
const CACHE_NAME = "masjid-alamin-v1";
const OFFLINE_URL = "/offline";
const STATIC_ASSETS = ["/icons/icon-192.png", "/icons/icon-512.png"];

async function precacheOffline() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(OFFLINE_URL);

  if (response.ok) {
    await cache.put(OFFLINE_URL, response.clone());
    const html = await response.text();
    const assets = [
      ...html.matchAll(/["'](\/_next\/static\/[^"']+)["']/g),
    ].map((match) => match[1]);

    await Promise.all(
      assets.map((url) => cache.add(url).catch(() => undefined)),
    );
  }

  await Promise.all(
    STATIC_ASSETS.map((url) => cache.add(url).catch(() => undefined)),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOffline());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

function isCacheable(request) {
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return false;
  }

  if (request.method !== "GET") {
    return false;
  }

  if (request.headers.get("RSC") === "1") {
    return false;
  }

  if (url.pathname.startsWith("/admin")) {
    return false;
  }

  return true;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    if (request.mode === "navigate") {
      const offline = await cache.match(OFFLINE_URL);

      if (offline) {
        return offline;
      }
    }

    throw new Error("Offline");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (!isCacheable(request)) {
    return;
  }

  const url = new URL(request.url);

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  }
});

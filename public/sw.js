const CACHE_NAME = 'hava-nasil-weather-data-cache-v1';

// Install aşaması: Önbelleğe gerekli dosyaları ekle
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/', // Ana sayfa
        '/index.html', // HTML dosyası
        '/styles.css', // CSS dosyası
        '/script.js', // JavaScript dosyası
        '/favicon.ico', // Favicon
      ]);
    })
  );
  self.skipWaiting(); // SW'nin hemen aktif olmasını sağlar
});

// Activate aşaması: Eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // SW'nin tüm istemcileri kontrol etmesini sağlar
});

// Fetch aşaması: İstekleri yönet ve önbellekten sun
self.addEventListener('fetch', (event) => {
  // Hava durumu API isteklerini işle
  if (event.request.url.startsWith('https://api.openweathermap.org/data/2.5/weather')) {
    event.respondWith(handleWeatherDataFetch(event.request));
  } else {
    // Diğer tüm istekler için önbellekten sunma stratejisi
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Hava durumu API isteklerini işleyen fonksiyon
async function handleWeatherDataFetch(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cachedData = await cachedResponse.json();
    const age = Date.now() - cachedData.timestamp;

    // 1 saatlik önbellek süresi
    if (age < 60 * 60 * 1000) {
      console.log('[Service Worker] Hava durumu verisi önbellekten sunuluyor');
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    const networkData = await networkResponse.clone().json();
    networkData.timestamp = Date.now();
    await cache.put(request, new Response(JSON.stringify(networkData)));
    console.log('[Service Worker] Hava durumu verisi ağdan alındı ve önbelleğe kaydedildi');
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Hava durumu verisi ağdan alınamadı', error);
    return cachedResponse || new Response('{"error": "Veri alınamadı"}', { status: 503 });
  }
}
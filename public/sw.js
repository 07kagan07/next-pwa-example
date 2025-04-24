const CACHE_NAME = 'hava-nasil-cache-v2';
const WEATHER_DATA_CACHE_NAME = 'hava-nasil-weather-data-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Buraya Next.js tarafından oluşturulan statik assetlerinizi (CSS, JS chunkları vb.) eklemeniz GEREKİR.
  // Bu liste build işleminden sonra incelenerek dinamik olarak güncellenmelidir.
];

// Kurulum aşaması: Önemli assetleri önbelleğe al
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install edildi');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Assetler önbelleğe alınıyor');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((err) => console.error('[Service Worker] Asset önbellekleme hatası:', err))
  );
  self.skipWaiting(); // Yeni SW'nin hemen etkinleşmesini sağlar
});

// Etkinleştirme aşaması: Eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Etkinleştirildi');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== WEATHER_DATA_CACHE_NAME) {
            console.log('[Service Worker] Eski önbellek siliniyor:', cacheName);
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

// Hava durumu API isteklerini yönetme fonksiyonu
async function handleWeatherDataFetch(request) {
  const cache = await caches.open(WEATHER_DATA_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Önbellekte veri varsa, onu döndür
    const cachedData = await cachedResponse.json();
    const age = Date.now() - cachedData.timestamp;

    // Önbellekteki veri 1 saatten eskiyse, ağı kontrol et
    if (age < 60 * 60 * 1000) {
      console.log('[Service Worker] Hava durumu verisi önbellekten sunuluyor');
      return cachedResponse;
    }
  }

  // Ağa git ve veriyi güncelle
  try {
    const networkResponse = await fetch(request);
    const networkData = await networkResponse.clone().json();
    networkData.timestamp = Date.now(); // Zaman damgası ekle
    await cache.put(request, new Response(JSON.stringify(networkData)));
    console.log('[Service Worker] Hava durumu verisi ağdan alındı ve önbelleğe kaydedildi');
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Hava durumu verisi ağdan alınamadı', error);
    // Çevrimdışı bir fallback gösterebilirsiniz (isteğe bağlı)
    return cachedResponse;
  }
}
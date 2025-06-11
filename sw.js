// File ini mengatur caching dan offline functionality

const CACHE_NAME = "Cleaner-cache-v1"; 
// Daftar file yang perlu di-cache untuk akses offline
const urlsToCache = [
  "/app.js",
  "/index.html",
  "/layanan-deep.html",
  "/layanan-reguler.html",
  "/layanan-repaint.html",
  "/style.css",
  "/images/logo.png",
];

// Install - Dijalankan saat SW pertama kali diinstall
self.addEventListener("install", async (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log("Service Worker: Membuka cache dan menyimpan file...");

      // Menggunakan loop untuk menambahkan file satu per satu
      // Membantu mengidentifikasi file mana yang menyebabkan error
      for (const url of urlsToCache) {
        try {
          await cache.add(url); // Menggunakan cache.add() untuk setiap file
          console.log(`Service Worker: Berhasil menyimpan ${url} ke cache.`);
        } catch (error) {
          console.error(`Service Worker: Gagal menyimpan ${url} ke cache. Error:`, error);
          // Meskipun ada error, loop akan terus mencoba menyimpan file lain.
        }
      }
      console.log("Service Worker: Proses caching selesai.");
    })()
  );
});

// Mengelola penghapusan cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker: Menghapus cache lama: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch dijalankan setiap kali browser meminta file
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
        
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
          // Jika offline dan request gambar, tampilkan logo default
          if (event.request.destination === 'image') {
            return caches.match('/images/logo.png');
          }

        return new Response('', {
          status: 503,
          statusText: 'Offline - resource not available in cache'
        });
      });
    })
  );
});
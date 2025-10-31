// Service Worker للتطبيق التقدمي (PWA)
const CACHE_NAME = 'geolearn-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/languageManager.js',
  '/src/js/quizEngine.js',
  '/assets/data/languages/ar.json',
  '/assets/data/languages/en.json',
  '/assets/data/languages/fr.json'
];

// التثبيت - تخزين الملفات في الكاش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// التنشيط - تنظيف الكاش القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// الاسترجاع - خدمة الطلبات من الكاش أولاً
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع الملف من الكاش إذا وجد
        if (response) {
          return response;
        }

        // وإلا جلب من الشبكة
        return fetch(event.request).then(response => {
          // التحقق من أن الاستجابة صالحة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // استنساخ الاستجابة
          const responseToCache = response.clone();

          // تخزين المورد الجديد في الكاش
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});
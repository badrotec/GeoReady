// Service Worker للتطبيق التقدمي (PWA)
const CACHE_NAME = 'geolearn-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.css',
  '/app.js',
  '/manifest.json',
  '/languages/ar.json',
  '/languages/en.json',
  '/languages/fr.json'
];

// إضافة الكويزات إلى الكاش
const quizUrls = [
  '/quizzes/basic_geology.json',
  '/quizzes/petrology.json',
  '/quizzes/hydrogeology.json',
  '/quizzes/geophysics.json',
  '/quizzes/field_work.json',
  '/quizzes/structural_geo.json',
  '/quizzes/historical_geo.json',
  '/quizzes/environmental_geo.json',
  '/quizzes/mining_geology.json',
  '/quizzes/engineering_geo.json'
];

urlsToCache.push(...quizUrls);

// التثبيت - تخزين الملفات في الكاش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
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
            console.log('Deleting old cache:', cacheName);
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
      .catch(() => {
        // Fallback للصفحة الرئيسية في حالة عدم الاتصال
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
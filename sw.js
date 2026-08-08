// Service Worker مینیمال — فقط برای این‌که PWABuilder اپ را «کاملاً نصب‌شدنی» تشخیص دهد.
// چون همهٔ داده‌ها آنلاین (Supabase) هستند، این فایل کش پیچیده‌ای انجام نمی‌دهد.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // فقط عبور می‌دهد — رفتار عادی مرورگر، بدون کش اضافی
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Service Worker با پشتیبانی آفلاین — یک نسخه از خودِ اپ (پوستهٔ اصلی) را روی گوشی ذخیره می‌کند
// تا وقتی اینترنت قطع است، به‌جای پیام خطای مرورگر، خودِ اپ باز شود.
// نکته: قابلیت‌هایی که به اینترنت نیاز دارند (همگام‌سازی Supabase، تلگرام، بله، پیامک، Google Calendar)
// طبیعتاً بدون اینترنت کار نمی‌کنند، اما خودِ صفحات و فرم‌ها باز می‌شوند.
//
// مهم: این Service Worker فقط درخواست‌های مربوط به خودِ همین سایت (فایل‌های اپ) را مدیریت می‌کند.
// درخواست‌های به سایت‌های دیگر (Supabase، تلگرام، بله، Google، بررسی اتصال اینترنت و ...)
// دست‌نخورده و طبیعی رها می‌شوند تا رفتار درست (از جمله شکست‌خوردن واقعی هنگام قطعی اینترنت) حفظ شود.

const CACHE_NAME = 'clinic-app-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    // درخواست به سایت دیگری است (Supabase, gstatic, api.telegram.org, tapi.bale.ai,
    // script.google.com, accounts.google.com, ...) — دست نمی‌زنیم، بگذار طبیعی رفتار کند
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // وقتی آنلاین هستیم، همیشه نسخهٔ تازه را می‌گیریم و کش را هم به‌روز نگه می‌داریم
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(() => {});
        return res;
      })
      .catch(() =>
        // وقتی آفلاین هستیم، از کش استفاده می‌کنیم؛ اگر آن درخواست خاص کش نشده بود،
        // صفحهٔ اصلی اپ را برمی‌گردانیم تا حداقل خودِ اپ باز شود
        caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});

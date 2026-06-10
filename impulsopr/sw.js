
const CACHE_NAME = 'impulso-high-efficiency-v11';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const isMediaRequest = event.request.headers.has('range') || 
                         event.request.url.match(/\.(mp3|m4a|wav|aac|ogg|mp4)$/i);
  const isApiRequest = event.request.url.includes('.supabase.co');
  
  if (isMediaRequest || isApiRequest) {
    // Return early without event.respondWith() to let the browser handle the stream/API natively
    return;
  }

  // Navegación: Prioridad a la red, caída al index.html cacheado
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets estáticos: Cache First para velocidad máxima
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200 && event.request.method === 'GET') {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      });
    })
  );
});

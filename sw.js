// Service worker: de app werkt ook zonder (of met slecht) bereik.
// Altijd eerst het netwerk proberen (zo krijg je de nieuwste versie), anders de bewaarde kopie.
const CACHE = 'haven-werkuren-v2';
const CORE = [
  './', 'index.html', 'app.js', 'loon.js', 'scan.js', 'privacy.html', 'belasting.json', 'manifest.webmanifest',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'vendor/leaflet/images/marker-icon.png', 'vendor/leaflet/images/marker-icon-2x.png',
  'vendor/leaflet/images/marker-shadow.png', 'vendor/leaflet/images/layers.png',
  'icons/icon-192.png', 'vendor/fonts/barlow-condensed-500.woff2', 'vendor/fonts/barlow-condensed-600.woff2', 'vendor/fonts/barlow-condensed-700.woff2', 'vendor/fonts/public-sans.woff2', 'icons/apple-touch-icon.png', 'icons/qr-app.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // enkel eigen bestanden; kaartbeelden en andere sites gewoon laten passeren
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        }
        // niet gevonden (bv. na een verhuis naar een nieuw adres): de bewaarde kopie gebruiken als die er is
        return caches.match(req, { ignoreSearch: true })
          .then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
          .then((hit) => hit || res);
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
        .then((hit) => hit || new Response('Offline', { status: 503 }))),
  );
});

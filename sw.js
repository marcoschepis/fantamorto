const CACHE_NAME = 'fantamorto-cache-v1';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './manifest.json',
    './loghi/logo_fantamorto.svg',
    './loghi/logo_fantamorto.png',
    './js/utils.js',
    './js/views/classifica.js',
    './js/views/squadre.js',
    './js/views/punteggi.js',
    './js/views/mercato.js',
    './js/views/admin.js',
    './js/views/regolamento.js',
    './js/script.js'
];

// Installazione: salva gli asset statici
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn('Errore cache per:', url)))
            );
        })
    );
    self.skipWaiting();
});

// Attivazione: cancella le vecchie cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetching: Network First con fallback sicuro
self.addEventListener('fetch', (event) => {
    // Ignora chiamate non GET o di terze parti (es. Google Analytics)
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Se la chiamata va a buon fine, salva la risposta in cache
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            })
            .catch(async () => {
                // Se siamo offline, cerca in cache
                // ignoreSearch: true ignora i vari ?123456789 alla fine dell'URL!
                const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
                
                if (cachedResponse) {
                    // Avvisa l'interfaccia che stiamo usando la cache
                    const clients = await self.clients.matchAll();
                    clients.forEach(client => {
                        client.postMessage({ type: 'USING_CACHE' });
                    });
                    return cachedResponse;
                }

                // FIX FONDAMENTALE: Se il file NON c'è in cache, ritorna un Response valido (invece di undefined)
                return new Response(JSON.stringify({ error: "Offline e risorsa non in cache" }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
    );
});
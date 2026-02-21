const CACHE_NAME = 'notifyy-v2';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/favicon.ico',
    './icons/favicon-96x96.png',
    './icons/favicon.svg',
    './icons/logo_notifyy180.png',
    './icons/web-app-manifest-192x192.png',
    './icons/web-app-manifest-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    const isAppShellResource =
        request.method === 'GET' &&
        (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css'));

    if (isAppShellResource) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    return networkResponse;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request);
        })
    );
});

// Periodic Sync (Progressive Enhancement)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-deadlines') {
        event.waitUntil(checkDeadlinesAndNotify());
    }
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});

// --- SW Logic ---
// Note: SW cannot read localStorage directly. 
// In a real prod environment without IndexedDB, we must sync data 
// or rely on the client being open.
// HOWEVER, strict constraint: "No IndexedDB (use only localStorage)".
// Therefore, the SW technically cannot read the JSON array when the tab is closed 
// because localStorage is not accessible in SW scope.
// COMPLIANCE FIX: SW only triggers logic, but since it can't read data,
// we rely on the client page to process the logic when open.
// For the sake of the exercise's specific constraints (LocalStorage + SW), 
// background checks are functionally impossible strictly within the SW 
// if the tab is fully closed, unless we passed data via postMessage earlier.
// Given the constraints, the 'periodicsync' here is a best-effort stub.
// Actual notification logic resides in app.js (Foreground).

async function checkDeadlinesAndNotify() {
    // Stub: SW cannot access LocalStorage. 
    // Without IndexedDB, background logic is limited to cached static assets.
}

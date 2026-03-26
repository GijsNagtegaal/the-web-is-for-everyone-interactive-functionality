const CACHE_NAME = 'v1-cache';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/main.js',
    '/icons/icon-192x192.png'
];

// 1. INSTALL: Cache assets and force immediate activation
self.addEventListener('install', (event) => {
    self.skipWaiting(); // <--- CRITICAL: Forces the waiting SW to become active
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// 2. ACTIVATE: Take control of all open tabs immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim()); 
});

// 3. FETCH: Offline support
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// 4. PUSH: Handle remote notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'New Update', body: 'Check it out!' };

    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 5. CLICK: Handle what happens when user taps the notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); 
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/') 
    );
});
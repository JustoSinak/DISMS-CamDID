// DISMS Service Worker for PWA functionality
const CACHE_NAME = 'disms-v1.0.0';
const STATIC_CACHE_NAME = 'disms-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'disms-dynamic-v1.0.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/CamDID.ico',
  '/logo192.png',
  '/logo512.png',
  // Core pages
  '/login-as',
  '/register-as',
  '/dashboard/citizen',
  '/dashboard/issuer', 
  '/dashboard/verifier',
  '/create-credential',
  '/my-identity',
  '/offline'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/auth\/me/,
  /\/api\/citizen\/profile/,
  /\/api\/credentials/,
  /\/api\/identity/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: try cache first, then network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request);
      })
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request);
    
    // Cache successful responses for specific endpoints
    if (networkResponse.ok && shouldCacheApiResponse(url.pathname)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache:', url.pathname);
    
    // Fallback to cache for critical endpoints
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for failed API requests
    return new Response(
      JSON.stringify({
        success: false,
        message: 'You are offline. Please check your connection.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Fallback to cached page or offline page
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlinePage = await caches.match('/offline');
    return offlinePage || new Response('You are offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Determine if API response should be cached
function shouldCacheApiResponse(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(pathname));
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'credential-sync') {
    event.waitUntil(syncCredentials());
  }
  
  if (event.tag === 'identity-sync') {
    event.waitUntil(syncIdentity());
  }
});

// Sync credentials when back online
async function syncCredentials() {
  try {
    // Get pending credential operations from IndexedDB
    const pendingOperations = await getPendingOperations('credentials');
    
    for (const operation of pendingOperations) {
      try {
        await fetch(operation.url, operation.options);
        await removePendingOperation('credentials', operation.id);
      } catch (error) {
        console.error('[SW] Failed to sync credential operation:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Credential sync failed:', error);
  }
}

// Sync identity when back online
async function syncIdentity() {
  try {
    // Get pending identity operations from IndexedDB
    const pendingOperations = await getPendingOperations('identity');
    
    for (const operation of pendingOperations) {
      try {
        await fetch(operation.url, operation.options);
        await removePendingOperation('identity', operation.id);
      } catch (error) {
        console.error('[SW] Failed to sync identity operation:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Identity sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingOperations(type) {
  // TODO: Implement IndexedDB operations
  return [];
}

async function removePendingOperation(type, id) {
  // TODO: Implement IndexedDB operations
  return true;
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from DISMS',
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('DISMS', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard/citizen')
    );
  }
});

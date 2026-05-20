const CACHE = 'kosten-v3'

const SHELL = [
  '/kosten-rechner/',
  '/kosten-rechner/index.html'
]

self.addEventListener('install', event => {
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    )
  )

  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  // APIs niemals cachen
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    event.respondWith(fetch(request))
    return
  }

  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/kosten-rechner/index.html')
      )
    )
    return
  }

  const isStaticAsset =
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'

  if (!isStaticAsset) {
    event.respondWith(fetch(request))
    return
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached

      return fetch(request).then(response => {
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const clone = response.clone()

          caches.open(CACHE).then(cache => {
            cache.put(request, clone)
          })
        }

        return response
      })
    })
  )
})
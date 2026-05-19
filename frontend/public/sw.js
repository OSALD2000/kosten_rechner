const CACHE = 'kosten-v2'
const SHELL = ['/kosten-rechner/', '/kosten-rechner/index.html']

self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)))
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    e.respondWith(fetch(request))
    return
  }

  if (request.mode === 'navigate') {
    e.respondWith(
      caches.match('/kosten-rechner/index.html').then(r => r || fetch(request))
    )
    return
  }

  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
        }
        return res
      })
    })
  )
})
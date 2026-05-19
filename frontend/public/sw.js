const CACHE = 'kosten-v1'
const SHELL = ['/index.html', '/']

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

  if (url.pathname.startsWith('/ausgaben') || url.pathname.startsWith('/auth')) {
    request.url = "/api/"+request.url
    console.log(url);
    
    e.respondWith(fetch(request))
    return
  }

  if (request.mode === 'navigate') {
    e.respondWith(
      caches.match('/index.html').then(r => r || fetch(request))
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

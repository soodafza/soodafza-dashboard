const CACHE = "soodafza-v1";
const ASSETS = ["/", "/index.html", "/styles.css"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e=>{
  const { request } = e; if (request.method !== "GET") return;
  e.respondWith(
    caches.match(request).then(cached=>{
      const fetchP = fetch(request).then(res=>{
        const copy = res.clone(); caches.open(CACHE).then(c=>c.put(request, copy)); return res;
      }).catch(()=>cached || caches.match("/index.html"));
      return cached || fetchP;
    })
  );
});

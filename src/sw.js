// sw.js   (cache-first PWA)

const CACHE = "v1";
const ASSETS = [
  "/", "/styles.css", "/manifest.json",
  "/src/nav.js","/src/router.js","/src/store.js",
  "/src/pos.js","/src/scan.js","/src/page/home.js"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      const copy=res.clone();
      if(e.request.method==="GET" && res.status===200)
        caches.open(CACHE).then(c=>c.put(e.request,copy));
      return res;
    }).catch(()=>caches.match("/")))
  );
});

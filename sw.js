const CACHE="gamesubs-shell-v2";
const RUNTIME="gamesubs-runtime-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./app.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,RUNTIME].includes(k)).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET" || req.headers.has("range")) return;
  const url=new URL(req.url);
  if(url.protocol!=="http:" && url.protocol!=="https:") return;
  e.respondWith((async()=>{
    const cacheName=url.origin===self.location.origin?CACHE:RUNTIME;
    const cache=await caches.open(cacheName);
    const hit=await cache.match(req);
    if(hit) return hit;
    try{
      const res=await fetch(req);
      if(res.ok && req.method==="GET"){
        try{await cache.put(req,res.clone());}catch(_){}
      }
      return res;
    }catch(err){
      const fallback=await cache.match(req);
      if(fallback) return fallback;
      throw err;
    }
  })());
});

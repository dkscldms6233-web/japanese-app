// 서비스워커: 네트워크 우선, 실패(오프라인) 시 캐시. 수정하면 바로 반영되고 오프라인에서도 열림.
const CACHE="jp-app-v1";
self.addEventListener("install",e=>{ self.skipWaiting(); });
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.method!=="GET"||!r.url.startsWith("http")) return;
  e.respondWith(
    fetch(r).then(res=>{
      if(res.status===200&&(res.type==="basic"||res.type==="cors")){
        const c=res.clone(); caches.open(CACHE).then(ch=>ch.put(r,c)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:false}).then(m=>m||caches.match(r,{ignoreSearch:true})))
  );
});

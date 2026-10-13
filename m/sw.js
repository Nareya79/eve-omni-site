// EVEOmni Mobile – Service Worker: nur die App-Huelle zwischenspeichern, EVE-/ESI-Daten nie
const V='m-2';const SHELL=['/m/','/m/index.html','/m/m.css','/m/m.js','/m/manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith('/m/'))return;
  // Netz zuerst (immer neueste Version), Zwischenspeicher nur ohne Netz
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/m/'))));
});

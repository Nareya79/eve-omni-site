// EVEOmni Mobile – Service Worker: nur die App-Huelle zwischenspeichern, EVE-/ESI-Daten nie
const V='m-22';const SHELL=['/m/','/m/index.html','/m/m.css','/m/m-i18n.js','/m/m.js','/m/m-views.js','/m/sync-core.js','/m/m-sync.js','/m/m-notify.js','/m/ob-game.js','/m/ob-game.css','/m/ob-field.css','/m/m-game.js','/m/manifest.webmanifest'];
importScripts('/m/sync-core.js');
// ---- Push (Stufe 2): der Server stupst nur an; Text holen + entschlüsseln wir selbst (Schlüssel liegt in IndexedDB) ----
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('eve-omni-m-push',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
const kvGet=k=>idb().then(d=>new Promise((res,rej)=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);}));
const kvSet=(k,v)=>idb().then(d=>new Promise((res,rej)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);}));
self.addEventListener('push',e=>{e.waitUntil((async()=>{
  let shown=0;
  try{
    const c=await kvGet('cfg');
    if(c&&c.base&&c.id&&c.key){
      const r=await self.OmniSync.pushPending(c.base,c.id,c.key,c.last||0),ty=c.types||{};
      for(const it of r.items){
        const m=it.msg||{};if(m.type&&ty[m.type]===false)continue;
        await self.registration.showNotification(m.title||'EVE Omni',{body:m.body||'',tag:m.tag||('n'+it.n),icon:'/m/notify-icon.png?v=3',badge:'/m/notify-badge.png'});shown++;
      }
      c.last=Math.max(c.last||0,r.last||0);await kvSet('cfg',c);
    }
  }catch(err){}
  if(!shown){ // Chrome verlangt bei jedem Push eine sichtbare Meldung: kurz zeigen und gleich schliessen
    await self.registration.showNotification('EVE Omni',{tag:'omni-quiet',silent:true});
    (await self.registration.getNotifications({tag:'omni-quiet'})).forEach(n=>n.close());
  }
})());});
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith('/m/'))return;
  // Netz zuerst (immer neueste Version), Zwischenspeicher nur ohne Netz
  // no-cache: beim Server nachfragen (ETag, meist nur 304) statt bis zu 10 Min. alte Dateien aus dem Browser-Speicher (GitHub Pages: max-age=600)
  const q=e.request.mode==='navigate'?new Request(e.request.url,{cache:'no-cache',credentials:'same-origin'}):new Request(e.request,{cache:'no-cache'});
  e.respondWith(fetch(q).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/m/'))));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if(c.url.includes('/m/')&&'focus' in c)return c.focus();}return self.clients.openWindow('/m/');}));});

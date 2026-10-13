/* EVEOmni Mobile – Benachrichtigungen (Stufe 1 + Push): Meldungen, solange die App läuft; mit Push (Stufe 2) auch bei geschlossener App über den Sync-Server.
   Prüft alle 5 Minuten: Order überboten, Skill-Warteschlange fast leer, Extraktor läuft aus, Trade-Ziel erreicht.
   Alles einstellbar unter Mehr › Benachrichtigungen. Nichts davon verlässt das Handy. */
(function(){
"use strict";
var M=window.OmniM,I=M.I18,el=M.el,KEY="eve-omni-m-notify",SEEN="eve-omni-m-notified";
var DEF={on:false,out:true,skill:true,pi:true,goal:true,push:false};
function cfg(){var o={};try{o=JSON.parse(M.lsGet(KEY)||"{}")||{};}catch(e){}return Object.assign({},DEF,o);}
function save(c){M.lsSet(KEY,JSON.stringify(c));}
function seen(){try{return JSON.parse(M.lsGet(SEEN)||"{}")||{};}catch(e){return {};}}
function mark(s,k){s[k]=Date.now();var lim=Date.now()-3*864e5;Object.keys(s).forEach(function(x){if(s[x]<lim)delete s[x];});M.lsSet(SEEN,JSON.stringify(s));}
function T(s){return I&&I.tr?I.tr(s):s;}
var N={log:[],last:0,busy:false},SK_END={},PI_EX={};
function granted(){return typeof Notification!=="undefined"&&Notification.permission==="granted";}
async function show(title,body,tag){
  title=T(title);body=T(body);N.log.push({title:title,body:body,tag:tag});
  if(!granted())return;
  try{var reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration("/m/");if(reg&&reg.showNotification){await reg.showNotification(title,{body:body,tag:tag,icon:"/m/notify-icon.png?v=2",badge:"/m/notify-badge.png"});return;}}catch(e){}
  try{new Notification(title,{body:body,tag:tag,icon:"/m/notify-icon.png?v=2"});}catch(e){}
}
function num(n){return M.exact(n);}
function price(p){return (Math.round(p*100)/100).toFixed(2).replace(".",I.dec);}
async function checkOut(c,s,seenNow){
  var chars=M.loadChars();
  await Promise.all(chars.map(async function(ch){
    try{
      if(!M.hasScope(ch,"esi-markets.read_character_orders.v1"))return;
      var orders=await M.esi(ch,"/characters/"+ch.character_id+"/orders/"),own={};orders.forEach(function(o){own[o.order_id]=1;});
      await M.names(orders.map(function(o){return o.type_id;}));
      for(var i=0;i<orders.length&&i<40;i++){var o=orders[i],best=await M.bestAt(o,own);if(best===null)continue;
        var lost=o.is_buy_order?best>o.price:best<o.price;if(!lost)continue;
        var k="out:"+o.order_id+":"+best;if(s[k])continue;mark(s,k);
        await show("Überboten: "+M.nm(o.type_id),ch.character_name+" · "+(o.is_buy_order?"Kauf":"Verkauf")+": bester Preis "+price(best)+" ISK · neu: "+price(M.newPrice(o.is_buy_order,best))+" ISK","out-"+o.order_id);}
    }catch(e){}
  }));
}
async function checkSkill(c,s){
  await Promise.all(M.loadChars().map(async function(ch){
    try{
      if(!M.hasScope(ch,"esi-skills.read_skillqueue.v1"))return;
      var q=(await M.esi(ch,"/characters/"+ch.character_id+"/skillqueue/")).filter(function(x){return x.finish_date;});
      if(!q.length){delete SK_END[ch.character_id];var k0="skill:"+ch.character_id+":empty:"+new Date().toISOString().slice(0,10);if(!s[k0]){mark(s,k0);await show("Skill-Warteschlange fast leer",ch.character_name+": Keine Skills in der Warteschlange!","skill-"+ch.character_id);}return;}
      var end=Math.max.apply(null,q.map(function(x){return new Date(x.finish_date).getTime();})),left=end-Date.now();SK_END[ch.character_id]={end:end,name:ch.character_name};
      if(left<864e5){var k="skill:"+ch.character_id+":"+end;if(!s[k]){mark(s,k);await show("Skill-Warteschlange fast leer",ch.character_name+": endet in "+M.fmtDur(left),"skill-"+ch.character_id);}}
    }catch(e){}
  }));
}
async function checkPi(c,s){
  PI_EX={};
  await Promise.all(M.loadChars().map(async function(ch){
    try{
      if(!M.hasScope(ch,"esi-planets.manage_planets.v1"))return;
      var pl=await M.esi(ch,"/characters/"+ch.character_id+"/planets/");
      await Promise.all(pl.map(async function(p){
        var d=await M.esi(ch,"/characters/"+ch.character_id+"/planets/"+p.planet_id+"/"),ex=(d.pins||[]).filter(function(x){return x.extractor_details&&x.expiry_time;}).map(function(x){return new Date(x.expiry_time).getTime();}).sort(function(a,b){return a-b;})[0];
        if(ex==null)return;var left=ex-Date.now();PI_EX[ch.character_id+":"+p.planet_id]={ex:ex,cn:ch.character_name,pid:p.planet_id};if(left>288e5)return;
        var k="pi:"+ch.character_id+":"+p.planet_id+":"+ex;if(s[k])return;mark(s,k);
        var name="Planet "+p.planet_id;try{name=(await M.pub("/universe/planets/"+p.planet_id+"/")).name||name;}catch(e){}
        await show("Extraktor läuft aus",name+" · "+ch.character_name+": "+(left<=0?"abgelaufen":"noch "+M.fmtDur(left)),"pi-"+p.planet_id);
      }));
    }catch(e){}
  }));
}
async function checkGoal(c,s){
  if(!M.tradeGoals)return;
  var g=[];try{g=await M.tradeGoals();}catch(e){}
  for(var i=0;i<g.length;i++){var k=g[i].key;if(s[k])continue;mark(s,k);await show("Trade-Ziel erreicht",g[i].name+" ×"+num(g[i].qty)+" · alle verkauft","goal-"+g[i].key);}
}

/* ---------- Push (Stufe 2): Gerät beim Sync-Server anmelden, geplante Meldungen eintragen ---------- */
var S=window.OmniSync;
function syncCfg(){try{var o=JSON.parse(M.lsGet("eve-omni-m-sync")||"{}");if(!o.code||!S||!S.validCode(o.code))return null;return {code:o.code,url:o.url||M.syncDefaultUrl};}catch(e){return null;}}
function idb(){return new Promise(function(res,rej){var r=indexedDB.open("eve-omni-m-push",1);r.onupgradeneeded=function(){r.result.createObjectStore("kv");};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});}
function kvSet(k,v){return idb().then(function(d){return new Promise(function(res,rej){var t=d.transaction("kv","readwrite");t.objectStore("kv").put(v,k);t.oncomplete=function(){res();};t.onerror=function(){rej(t.error);};});});}
function kvGet(k){return idb().then(function(d){return new Promise(function(res,rej){var q=d.transaction("kv").objectStore("kv").get(k);q.onsuccess=function(){res(q.result);};q.onerror=function(){rej(q.error);};});});}
function kvDel(k){return idb().then(function(d){return new Promise(function(res,rej){var t=d.transaction("kv","readwrite");t.objectStore("kv").delete(k);t.oncomplete=function(){res();};t.onerror=function(){rej(t.error);};});});}
function u8(b64){b64=b64.replace(/-/g,"+").replace(/_/g,"/");while(b64.length%4)b64+="=";var s=atob(b64),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;}
async function swReg(){
  if(!("serviceWorker" in navigator)||typeof PushManager==="undefined")throw new Error("Dieser Browser kann keine Push-Meldungen.");
  var reg=await navigator.serviceWorker.getRegistration("/m/");if(!reg)reg=await navigator.serviceWorker.register("/m/sw.js",{scope:"/m/"});
  await navigator.serviceWorker.ready;return reg;
}
N.enablePush=async function(c){
  var sc=syncCfg();if(!sc)throw new Error("Erst unter „Abgleich mit dem PC“ verbinden.");
  var reg=await swReg(),old=await reg.pushManager.getSubscription();if(old){try{await old.unsubscribe();}catch(e){}}
  var key=await S.pushKey(sc.url),sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:u8(key)}),j=sub.toJSON();
  var r=await S.pushSubscribe(sc.url,sc.code,j),d=await S.derive(sc.code);
  await kvSet("cfg",{base:sc.url,id:d.id,key:d.key,last:r.last||0,types:{out:c.out!==false,goal:c.goal!==false}});
  M.lsSet("eve-omni-m-push-ep",j.endpoint);M.lsSet("eve-omni-m-push-hash","");
};
N.disablePush=async function(){
  var sc=syncCfg();
  try{var reg=await navigator.serviceWorker.getRegistration("/m/"),sub=reg&&await reg.pushManager.getSubscription();var ep=(sub&&sub.endpoint)||M.lsGet("eve-omni-m-push-ep");
    if(sub)await sub.unsubscribe();if(sc&&ep){await S.pushOff(sc.url,sc.code,ep);await S.pushEvents(sc.url,sc.code,[]);}}catch(e){}
  try{await kvDel("cfg");}catch(e){}M.lsSet("eve-omni-m-push-hash","");
};
async function syncTypes(c){try{var o=await kvGet("cfg");if(o){o.types={out:!!c.out,goal:!!c.goal};await kvSet("cfg",o);}}catch(e){}}
var PN={};
async function syncEvents(c){
  var sc=syncCfg();if(!sc||!S)return;
  var ev=[],now=Date.now();
  if(c.skill)Object.keys(SK_END).forEach(function(cid){var x=SK_END[cid],at=x.end-864e5;if(at>now)ev.push({key:"skill:"+cid,at:at,msg:{type:"skill",title:T("Skill-Warteschlange fast leer"),body:T(x.name+": endet in 24 Std."),tag:"skill-"+cid}});});
  if(c.pi){var ks=Object.keys(PI_EX);for(var i=0;i<ks.length;i++){var x=PI_EX[ks[i]],at=x.ex-288e5;if(at<=now)continue;
    if(!PN[x.pid]){PN[x.pid]="Planet "+x.pid;try{PN[x.pid]=(await M.pub("/universe/planets/"+x.pid+"/")).name||PN[x.pid];}catch(e){}}
    ev.push({key:"pi:"+ks[i],at:at,msg:{type:"pi",title:T("Extraktor läuft aus"),body:T(PN[x.pid]+" · "+x.cn+": noch 8 Std."),tag:"pi-"+x.pid}});}}
  ev.sort(function(a,b){return a.at-b.at;});ev=ev.slice(0,50);
  var h=JSON.stringify(ev.map(function(e){return [e.key,Math.round(e.at/6e4)];}))+sc.url;
  if(h===M.lsGet("eve-omni-m-push-hash"))return;
  try{await S.pushEvents(sc.url,sc.code,ev);M.lsSet("eve-omni-m-push-hash",h);N.events=ev;}catch(e){}
}
N.syncEvents=function(){return syncEvents(cfg());};
var lastPi=0;
N.check=async function(force){
  var c=cfg();if(N.busy||!M.loadChars().length)return;if(!c.on&&!force)return;
  N.busy=true;N.last=Date.now();var s=seen();
  try{
    if(c.out)await checkOut(c,s);if(c.skill)await checkSkill(c,s);
    if(c.pi&&(Date.now()-lastPi>18e5||force)){lastPi=Date.now();await checkPi(c,s);}
    if(c.goal)await checkGoal(c,s);
    if(c.push)await syncEvents(c);
  }finally{N.busy=false;var st=document.getElementById("notify-last");if(st)st.textContent="Zuletzt geprüft "+M.now();}
};
var timer=null;
function start(){if(timer)return;timer=setInterval(function(){if(cfg().on)N.check();},300000);setTimeout(function(){N.check();},4000);}
document.addEventListener("visibilitychange",function(){if(!document.hidden&&cfg().on&&Date.now()-N.last>6e4)N.check();});
N.card=function(parent,before){
  var old=document.getElementById("notify-opt");if(old)old.remove();
  var c=cfg(),card=el("div","card");card.id="notify-opt";card.appendChild(el("div","nm","Benachrichtigungen"));
  card.appendChild(el("div","sub","Meldungen kommen, solange die App geöffnet ist oder kurz im Hintergrund läuft. Mit Push kommen sie auch bei geschlossener App."));
  var msg=el("p","msg","");
  function row(label,key,id){var l=el("label","sub");l.style.cssText="display:flex;gap:8px;align-items:center;margin:8px 0";var i=document.createElement("input");i.type="checkbox";i.id=id;i.checked=!!c[key];
    i.onchange=function(){c[key]=i.checked;save(c);if(key==='out'||key==='goal')syncTypes(c);if(c.push&&(key==='skill'||key==='pi')){M.lsSet('eve-omni-m-push-hash','');N.check(true);}};l.appendChild(i);l.appendChild(document.createTextNode(label));return l;}
  var onb=el("button",c.on?"":"ghost",c.on?"An":"Aus");onb.id="notify-on";onb.style.cssText="min-width:90px;margin-top:8px";
  onb.onclick=async function(){
    if(!c.on){
      if(typeof Notification==="undefined"){msg.textContent="Dieser Browser kann keine Benachrichtigungen.";msg.className="msg bad";return;}
      var p=Notification.permission;if(p==="default"){try{p=await Notification.requestPermission();}catch(e){}}
      if(p!=="granted"){msg.textContent="Auf dem Handy blockiert – in den Browser-Einstellungen für diese Seite erlauben.";msg.className="msg bad";return;}
      c.on=true;save(c);start();N.check();
    }else{c.on=false;save(c);}
    N.card(parent,before);
  };
  card.appendChild(onb);
  var opts=el("div");opts.style.display=c.on?"":"none";opts.id="notify-types";
  opts.appendChild(row("Order überboten","out","notify-out"));opts.appendChild(row("Skill-Warteschlange fast leer (unter 24 Std.)","skill","notify-skill"));
  opts.appendChild(row("Extraktor läuft aus (unter 8 Std.)","pi","notify-pi"));opts.appendChild(row("Trade-Ziel erreicht (alles verkauft)","goal","notify-goal"));
  var pl=el("label","sub");pl.style.cssText="display:flex;gap:8px;align-items:center;margin:12px 0 4px;font-weight:600";var pi=document.createElement("input");pi.type="checkbox";pi.id="notify-push";pi.checked=!!c.push;
  pi.onchange=async function(){
    msg.className="msg";msg.textContent="";
    try{
      if(pi.checked){await N.enablePush(c);c.push=true;save(c);msg.textContent="Push eingerichtet ✓";N.check(true);}
      else{await N.disablePush();c.push=false;save(c);}
    }catch(e){c.push=false;save(c);pi.checked=false;msg.className="msg bad";msg.textContent=(e&&e.message)||"Push-Anmeldung ging nicht";}
  };
  pl.appendChild(pi);pl.appendChild(document.createTextNode("Auch bei geschlossener App (Push)"));opts.appendChild(pl);
  opts.appendChild(el("div","sub","Dafür muss die App mit dem Sync-Server verbunden sein (Abgleich mit dem PC). Überboten-Meldungen kommen vom PC-Programm, solange es läuft."));
  var tb=el("button","ghost","Test-Meldung senden");tb.id="notify-test";tb.style.cssText="margin-top:4px";tb.onclick=function(){show("Benachrichtigungen sind an ✓","So sieht eine Meldung aus.","test");};opts.appendChild(tb);
  opts.appendChild(el("div","sub","")).id="notify-last";card.appendChild(opts);card.appendChild(msg);
  parent.insertBefore(card,before);
};
window.OmniNotify=N;
if(cfg().on&&granted())start();
})();

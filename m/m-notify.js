/* EVEOmni Mobile – Benachrichtigungen (Stufe 1): Meldungen, solange die App geöffnet ist oder kurz im Hintergrund läuft.
   Prüft alle 5 Minuten: Order überboten, Skill-Warteschlange fast leer, Extraktor läuft aus, Trade-Ziel erreicht.
   Alles einstellbar unter Mehr › Benachrichtigungen. Nichts davon verlässt das Handy. */
(function(){
"use strict";
var M=window.OmniM,I=M.I18,el=M.el,KEY="eve-omni-m-notify",SEEN="eve-omni-m-notified";
var DEF={on:false,out:true,skill:true,pi:true,goal:true};
function cfg(){var o={};try{o=JSON.parse(M.lsGet(KEY)||"{}")||{};}catch(e){}return Object.assign({},DEF,o);}
function save(c){M.lsSet(KEY,JSON.stringify(c));}
function seen(){try{return JSON.parse(M.lsGet(SEEN)||"{}")||{};}catch(e){return {};}}
function mark(s,k){s[k]=Date.now();var lim=Date.now()-3*864e5;Object.keys(s).forEach(function(x){if(s[x]<lim)delete s[x];});M.lsSet(SEEN,JSON.stringify(s));}
function T(s){return I&&I.tr?I.tr(s):s;}
var N={log:[],last:0,busy:false};
function granted(){return typeof Notification!=="undefined"&&Notification.permission==="granted";}
async function show(title,body,tag){
  title=T(title);body=T(body);N.log.push({title:title,body:body,tag:tag});
  if(!granted())return;
  try{var reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration("/m/");if(reg&&reg.showNotification){await reg.showNotification(title,{body:body,tag:tag,icon:"/icon-512.png",badge:"/icon-512.png"});return;}}catch(e){}
  try{new Notification(title,{body:body,tag:tag,icon:"/icon-512.png"});}catch(e){}
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
      if(!q.length){var k0="skill:"+ch.character_id+":empty:"+new Date().toISOString().slice(0,10);if(!s[k0]){mark(s,k0);await show("Skill-Warteschlange fast leer",ch.character_name+": Keine Skills in der Warteschlange!","skill-"+ch.character_id);}return;}
      var end=Math.max.apply(null,q.map(function(x){return new Date(x.finish_date).getTime();})),left=end-Date.now();
      if(left<864e5){var k="skill:"+ch.character_id+":"+end;if(!s[k]){mark(s,k);await show("Skill-Warteschlange fast leer",ch.character_name+": endet in "+M.fmtDur(left),"skill-"+ch.character_id);}}
    }catch(e){}
  }));
}
async function checkPi(c,s){
  await Promise.all(M.loadChars().map(async function(ch){
    try{
      if(!M.hasScope(ch,"esi-planets.manage_planets.v1"))return;
      var pl=await M.esi(ch,"/characters/"+ch.character_id+"/planets/");
      await Promise.all(pl.map(async function(p){
        var d=await M.esi(ch,"/characters/"+ch.character_id+"/planets/"+p.planet_id+"/"),ex=(d.pins||[]).filter(function(x){return x.extractor_details&&x.expiry_time;}).map(function(x){return new Date(x.expiry_time).getTime();}).sort(function(a,b){return a-b;})[0];
        if(ex==null)return;var left=ex-Date.now();if(left>288e5)return;
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
var lastPi=0;
N.check=async function(force){
  var c=cfg();if(N.busy||!M.loadChars().length)return;if(!c.on&&!force)return;
  N.busy=true;N.last=Date.now();var s=seen();
  try{
    if(c.out)await checkOut(c,s);if(c.skill)await checkSkill(c,s);
    if(c.pi&&(Date.now()-lastPi>18e5||force)){lastPi=Date.now();await checkPi(c,s);}
    if(c.goal)await checkGoal(c,s);
  }finally{N.busy=false;var st=document.getElementById("notify-last");if(st)st.textContent="Zuletzt geprüft "+M.now();}
};
var timer=null;
function start(){if(timer)return;timer=setInterval(function(){if(cfg().on)N.check();},300000);setTimeout(function(){N.check();},4000);}
document.addEventListener("visibilitychange",function(){if(!document.hidden&&cfg().on&&Date.now()-N.last>6e4)N.check();});
N.card=function(parent,before){
  var old=document.getElementById("notify-opt");if(old)old.remove();
  var c=cfg(),card=el("div","card");card.id="notify-opt";card.appendChild(el("div","nm","Benachrichtigungen"));
  card.appendChild(el("div","sub","Meldungen kommen, solange die App geöffnet ist oder kurz im Hintergrund läuft. Echte Push-Meldungen bei geschlossener App folgen später."));
  var msg=el("p","msg","");
  function row(label,key,id){var l=el("label","sub");l.style.cssText="display:flex;gap:8px;align-items:center;margin:8px 0";var i=document.createElement("input");i.type="checkbox";i.id=id;i.checked=!!c[key];
    i.onchange=function(){c[key]=i.checked;save(c);};l.appendChild(i);l.appendChild(document.createTextNode(label));return l;}
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
  var tb=el("button","ghost","Test-Meldung senden");tb.id="notify-test";tb.style.cssText="margin-top:4px";tb.onclick=function(){show("Benachrichtigungen sind an ✓","So sieht eine Meldung aus.","test");};opts.appendChild(tb);
  opts.appendChild(el("div","sub","")).id="notify-last";card.appendChild(opts);card.appendChild(msg);
  parent.insertBefore(card,before);
};
window.OmniNotify=N;
if(cfg().on&&granted())start();
})();

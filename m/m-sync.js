/* EVEOmni Mobile – Abgleich vom PC (M4): Meine Trades, Hauling-Läufe, Preis-Merkliste. Nur lesen: der PC ist die Quelle.
   Daten liegen verschlüsselt auf dem Sync-Server (Unraid); Code und Schlüssel verlassen das Gerät nie. */
(function(){
"use strict";
var M=window.OmniM,el=M.el,exact=M.exact,short=M.short,lsGet=M.lsGet,lsSet=M.lsSet,S=window.OmniSync;
var KEY="eve-omni-m-sync",DATA="eve-omni-m-sync-data",DEFAULT_URL="https://fluxserver01.taileafff1.ts.net:8443/sync-omni";
M.syncDefaultUrl=DEFAULT_URL;
function cfg(){try{return JSON.parse(lsGet(KEY))||{};}catch(e){return {};}}
function saveCfg(o){lsSet(KEY,JSON.stringify(o));}
function cached(){try{return JSON.parse(lsGet(DATA));}catch(e){return null;}}
function when(t){return new Date(t).toLocaleString(M.I18.loc,{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}
function priceTxt(p){return M.priceTxt(p);}
function de2(n){var f=(Math.round(Math.abs(n)*100)/100).toFixed(2).split(".");f[0]=f[0].replace(/\B(?=(\d{3})+(?!\d))/g,M.I18.th);return (n<0?"-":"")+f[0]+(f[1]==="00"?"":M.I18.dec+f[1]);}
function sg(n){return (n>0?"+":"")+de2(n);}
function priceRow(card,label,p){if(!(p>0))return;var r=el("div","row");r.style.marginTop="6px";r.appendChild(el("div","grow sub",label));var v=el("div","isk",de2(p)+" ISK");r.appendChild(v);var b=el("button","ghost","Kopieren");b.style.cssText="min-height:36px;padding:4px 10px";b.setAttribute("data-copy",priceTxt(p));b.onclick=function(){M.copy(priceTxt(p),b);};r.appendChild(b);card.appendChild(r);}

/* ---------- Fortschritt: aus den Wallet-Transaktionen des Charakters (nur auf dem Handy berechnet) ---------- */
var TX={},FEE={};
function charFor(id,name){var a=M.loadChars();for(var i=0;i<a.length;i++){if(id!=null&&a[i].character_id===String(id))return a[i];}
  for(i=0;i<a.length;i++)if(name&&a[i].character_name===name)return a[i];return null;}
function getTx(c){var k=c.character_id;if(!TX[k])TX[k]=M.esi(c,"/characters/"+k+"/wallet/transactions/");return TX[k];}
function getFee(c){var k=c.character_id;if(!FEE[k])FEE[k]=M.fees(c).catch(function(){return {tax:0.075,broker:0.03};});return FEE[k];}
function calc(tx,tid,since,fe,plan){
  var b=0,bs=0,s=0,ss=0;
  tx.forEach(function(t){if(t.type_id!==tid)return;if(since&&new Date(t.date).getTime()<since)return;
    if(t.is_buy){b+=t.quantity;bs+=t.quantity*t.unit_price;}else{s+=t.quantity;ss+=t.quantity*t.unit_price;}});
  var bAvg=b?bs/b:0,sAvg=s?ss/s:0,f=1-fe.tax-fe.broker;
  var per=s&&b?sAvg*f-bAvg:0,stock=Math.max(0,b-s);
  var exp=(stock>0&&plan>0&&b)?stock*(plan*f-bAvg):null;
  return {b:b,s:s,bAvg:bAvg,sAvg:sAvg,stock:stock,per:per,profit:per*s,exp:exp,known:b>0};
}
function sinceOf(x){var t=new Date(x).getTime();return isFinite(t)?t:0;}
function bar(frac,color){var o=el("div");o.style.cssText="height:6px;border-radius:3px;background:var(--ln);margin-top:4px;overflow:hidden";var f=el("div");f.style.cssText="height:100%;background:"+color+";width:"+Math.round(Math.max(0,Math.min(1,frac))*100)+"%";o.appendChild(f);return o;}
function resLine(box,label,v,per){var r=el("div","row");r.style.marginTop="6px";r.appendChild(el("div","grow sub",label));var x=el("div","isk",sg(v)+" ISK");x.style.color=v<0?"var(--bad)":"var(--ok)";x.appendChild(el("small","",M.short(v)));r.appendChild(x);box.appendChild(r);
  if(per!=null){var p=el("div","sub","Netto pro Stück: "+sg(per)+" ISK · gesamt "+sg(v)+" ISK");box.appendChild(p);}}
var ORD={},EXP={},UI=[],SORT="date";
function sortList(l){var a=l.slice(),st=function(t){return t.status==="done"?2:t.buyDone?1:0;};
  var f={date:function(x,y){return sinceOf(y.created)-sinceOf(x.created);},profit:function(x,y){return (y.unit*y.qty||0)-(x.unit*x.qty||0);},name:function(x,y){return String(x.name).localeCompare(String(y.name));},place:function(x,y){return String(x.hub||"").localeCompare(String(y.hub||""));},status:function(x,y){return st(x)-st(y);}}[SORT]||null;if(f)a.sort(f);return a;}
function getOrd(c){var k=c.character_id;if(!ORD[k])ORD[k]=M.esi(c,"/characters/"+k+"/orders/");return ORD[k];}
function sizeGet(){var v=parseFloat(lsGet("eve-omni-m-wl-size"));return v>=0.8&&v<=1.4?v:1;}
function setBorder(c,col){c.style.borderLeft="4px solid "+col;}
function sumFill(t,k){
  var u=t._ui;if(!u)return;
  u.sum.textContent="Gekauft "+exact(k.b)+"/"+exact(t.qty||k.b)+" · Verkauft "+exact(k.s)+" · Lager "+exact(k.stock);
  u.bar.firstChild.style.width=Math.round(Math.max(0,Math.min(1,(t.qty?k.s/t.qty:0)))*100)+"%";
  if(k.s&&k.b){u.res.textContent=sg(k.profit)+" ISK";u.res.style.color=k.profit<0?"var(--bad)":"var(--ok)";}
}
function fillTrade(box,t,c){
  Promise.all([getTx(c),getFee(c)]).then(function(r){
    var k=calc(r[0],t.tid,sinceOf(t.created),r[1],t.sell);box.textContent="";sumFill(t,k);
    if(!k.b&&!k.s){box.appendChild(el("div","sub","Keine Käufe/Verkäufe seit dem Anlegen gefunden."));return;}
    var q=t.qty||k.b;
    var l1=el("div","sub","Gekauft "+exact(k.b)+" / "+exact(q)+(k.b?" · Ø "+de2(k.bAvg)+" ISK":""));box.appendChild(l1);box.appendChild(bar(k.b/q,"var(--cy)"));
    var l2=el("div","sub","Verkauft "+exact(k.s)+" / "+exact(q)+(k.s?" · Ø "+de2(k.sAvg)+" ISK":""));l2.style.marginTop="6px";box.appendChild(l2);box.appendChild(bar(k.s/q,"var(--ok)"));
    var l3=el("div","sub","Lager "+exact(k.stock)+" Stück");l3.style.marginTop="6px";box.appendChild(l3);
    if(k.s&&k.b)resLine(box,k.profit<0?"Verlust bisher (netto, geschätzt)":"Gewinn bisher (netto, geschätzt)",k.profit,k.per);
    else box.appendChild(el("div","sub","Noch nichts verkauft."));
    if(k.exp!=null)resLine(box,"Erwartet bei Verkauf des Lagers (Plan)",k.exp,null);
    t._res=k;
  }).catch(function(e){box.textContent="";box.appendChild(el("div","sub","Fortschritt nicht abrufbar ("+(e.message||"?")+")"));});
}
/* Überboten-Prüfung: eigene Order (am Handy eingeloggter Charakter) gegen die beste Konkurrenz am selben Ort */
function checkOrder(t,ch,done){
  var u=t._ui,buy=!t.buyDone;
  /* Lauf-Trades: verkaufen darf jeder Charakter des Laufs (wie am PC) – dann die Orders aller eingeloggten Charaktere durchsuchen */
  var who=t.run&&!buy?M.loadChars().filter(function(c){return M.hasScope(c,"esi-markets.read_character_orders.v1");}):[ch];
  Promise.all(who.map(function(c){return getOrd(c).catch(function(e){return c===ch?Promise.reject(e):[];});})).then(function(a){return [].concat.apply([],a);}).then(async function(orders){
    var own={};orders.forEach(function(o){own[o.order_id]=1;});
    var mine=orders.filter(function(x){return x.type_id===t.tid&&!!x.is_buy_order===buy;}).sort(function(a,b){return buy?b.price-a.price:a.price-b.price;}),o=mine[0];
    if(!o){u.ord.textContent=buy?"Noch keine Kauforder":"Noch keine Verkaufsorder";u.badge.textContent="";done(null);return;}
    var best=await M.bestAt(o,own);
    var side=buy?"Kauf":"Verkauf";
    var lost=best!=null&&(buy?best>o.price:best<o.price);
    var l1=el("div","sub",(buy?"Deine Kauforder: ":"Deine Verkaufsorder: ")+exact(o.volume_remain)+" Stück zu "+de2(o.price)+" ISK");
    u.ord.textContent="";u.ord.appendChild(l1);
    if(lost){
      var np=M.newPrice(buy,best);setBorder(u.card,"var(--gd,#e0a030)");u.badge.textContent="Überboten";u.badge.style.cssText="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:#e0a030;color:#111;white-space:nowrap";
      var r=el("div","row");r.style.marginTop="6px";r.appendChild(el("div","grow sub",side+": überboten → neu"));var v=el("div","isk",de2(np)+" ISK");r.appendChild(v);
      var bt=el("button","ghost","Kopieren");bt.style.cssText="min-height:36px;padding:4px 10px";bt.setAttribute("data-copy",priceTxt(np));bt.onclick=function(){M.copy(priceTxt(np),bt);};r.appendChild(bt);u.ord.appendChild(r);
      u.ord.appendChild(el("div","sub","Beste Konkurrenz: "+de2(best)+" ISK"));
    }else{u.badge.textContent="Vorne ✓";u.badge.style.cssText="font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;background:var(--ok);color:#111;white-space:nowrap";}
    done(lost);
  }).catch(function(e){u.ord.textContent="";u.ord.appendChild(el("div","sub","Konkurrenz nicht prüfbar ("+(e.message||"?")+")"));done(null);});
}
var HUBN={jita:"Jita",amarr:"Amarr",dodixie:"Dodixie",rens:"Rens",hek:"Hek"};
function head(c,t,title,sub,right,rsub){
  var hd=el("div","row");hd.style.cursor="pointer";var g=el("div","grow");var n=el("div","nm",title);g.appendChild(n);g.appendChild(el("div","sub",sub));hd.appendChild(g);
  var rg=el("div","isk",right||"");if(rsub){rg.appendChild(el("small","",rsub));}hd.appendChild(rg);c.appendChild(hd);return {hd:hd,g:g,rg:rg,n:n};
}
function tradeCard(t){
  var c=el("div","card");setBorder(c,"var(--ln)");
  var margin=(t.margin!=null&&isFinite(t.margin))?(Math.round(t.margin*10)/10).toString().replace(".",M.I18.dec)+" %":"";
  var h=head(c,t,t.name+" ×"+exact(t.qty||0),(HUBN[t.hub]||t.stName||t.hub||"")+(t.charName?" · "+t.charName:"")+" · "+(t.status==="done"?"erledigt":t.buyDone?"gekauft, verkaufen":"einkaufen"),"",margin?"":"");
  var badge=el("span","");badge.style.marginLeft="6px";h.n.appendChild(badge);
  var res=h.rg;if(t.unit>0&&t.qty>0){res.textContent="";res.appendChild(document.createTextNode("Plan "+sg(t.unit*t.qty)+" ISK"));res.appendChild(el("small","",margin?"Marge "+margin:""));res.style.color="var(--mu)";}
  var sum=el("div","sub","");sum.style.marginTop="4px";c.appendChild(sum);var br=bar(0,"var(--ok)");c.appendChild(br);
  var det=el("div");det.style.display=EXP.all?"":"none";det.className="wl-det";c.appendChild(det);
  h.hd.onclick=function(){det.style.display=det.style.display==="none"?"":"none";};
  var ord=el("div");det.appendChild(ord);
  priceRow(det,"Kaufen zu (Plan)",t.buy);priceRow(det,"Verkaufen zu (Plan)",t.sell);
  if(t.unit>0&&t.qty>0){var n=el("div","sub","Plan netto: "+de2(t.unit)+" ISK pro Stück · "+de2(t.unit*t.qty)+" ISK gesamt");n.style.marginTop="6px";det.appendChild(n);}
  var pg=el("div","");pg.style.marginTop="8px";det.appendChild(pg);var ch=charFor(t.charId,t.charName);
  t._ui={card:c,sum:sum,bar:br,res:res,badge:badge,ord:ord};
  if(!ch){var m1="Charakter nicht auf dem Handy eingeloggt – kein Fortschritt.";sum.textContent=m1;pg.appendChild(el("div","sub",m1));}
  else if(!M.hasScope(ch,"esi-wallet.read_character_wallet.v1"))pg.appendChild(el("div","sub","Berechtigung fehlt – neu einloggen."));
  else{sum.textContent="Fortschritt wird geladen …";pg.appendChild(el("div","sub","Fortschritt wird geladen …"));fillTrade(pg,t,ch);}
  if(ch&&t.status!=="done"&&M.hasScope(ch,"esi-markets.read_character_orders.v1"))t._chk=function(cb){checkOrder(t,ch,cb);};
  return c;
}
function runCard(r){
  var c=el("div","card");setBorder(c,"var(--cy)");
  var items=r.items||[],h=head(c,r,"Lauf nach "+String(r.toName||"?").split(" - ")[0],(r.charName||"")+" · "+items.length+" Waren · "+(r.status==="done"?"erledigt":r.buyDone?"unterwegs/verkaufen":"einkaufen"),"","");
  var sum=el("div","sub","");sum.style.marginTop="4px";c.appendChild(sum);var br=bar(0,"var(--ok)");c.appendChild(br);
  var det=el("div");det.style.display=EXP.all?"":"none";det.className="wl-det";c.appendChild(det);h.hd.onclick=function(){det.style.display=det.style.display==="none"?"":"none";};
  var ch=charFor(r.charId,r.charName),pg=el("div","");det.appendChild(pg);
  var rows=items.slice(0,12).map(function(i){var x=el("div","row");x.style.marginTop="6px";var g=el("div","grow");g.appendChild(el("div","sub",i.name));var d=el("div","sub","");g.appendChild(d);x.appendChild(g);x.appendChild(el("div","isk","× "+exact(i.q||0)));det.appendChild(x);return d;});
  if(items.length>12)det.appendChild(el("div","sub","… +"+(items.length-12)+" weitere"));
  var tot=el("div","");tot.style.marginTop="8px";det.appendChild(tot);
  if(!ch){sum.textContent="Charakter nicht auf dem Handy eingeloggt – kein Fortschritt.";tot.appendChild(el("div","sub","Charakter nicht auf dem Handy eingeloggt – kein Fortschritt."));}
  else if(!M.hasScope(ch,"esi-wallet.read_character_wallet.v1"))tot.appendChild(el("div","sub","Berechtigung fehlt – neu einloggen."));
  else{sum.textContent="Fortschritt wird geladen …";tot.appendChild(el("div","sub","Fortschritt wird geladen …"));
    Promise.all([getTx(ch),getFee(ch)]).then(function(z){var since=sinceOf(r.created),sum2=0,bought=0,sold=0,qty=0,stock=0,any=false;
      items.forEach(function(i,n){var k=calc(z[0],i.tid,since,z[1],i.sp);qty+=i.q||0;bought+=Math.min(k.b,i.q||k.b);sold+=Math.min(k.s,i.q||k.s);stock+=k.stock;sum2+=k.profit;if(k.b||k.s)any=true;
        if(rows[n])rows[n].textContent="Gekauft "+exact(k.b)+" · Verkauft "+exact(k.s)+" · Lager "+exact(k.stock)+(k.s&&k.b?" · "+sg(k.profit)+" ISK":"");});
      tot.textContent="";
      sum.textContent="Gekauft "+exact(bought)+"/"+exact(qty)+" · Verkauft "+exact(sold)+" · Lager "+exact(stock);br.firstChild.style.width=Math.round((qty?Math.min(1,sold/qty):0)*100)+"%";
      if(sold){h.rg.textContent=sg(sum2)+" ISK";h.rg.style.color=sum2<0?"var(--bad)":"var(--ok)";}
      if(!any){sum.textContent="";tot.appendChild(el("div","sub","Keine Käufe/Verkäufe seit dem Anlegen gefunden."));return;}
      tot.appendChild(el("div","sub","Gekauft "+exact(bought)+" / "+exact(qty)));tot.appendChild(bar(qty?bought/qty:0,"var(--cy)"));
      var l2=el("div","sub","Verkauft "+exact(sold)+" / "+exact(qty));l2.style.marginTop="6px";tot.appendChild(l2);tot.appendChild(bar(qty?sold/qty:0,"var(--ok)"));
      var l3=el("div","sub","Lager "+exact(stock)+" Stück");l3.style.marginTop="6px";tot.appendChild(l3);
      if(sold)resLine(tot,sum2<0?"Verlust bisher (netto, geschätzt)":"Gewinn bisher (netto, geschätzt)",sum2,null);else tot.appendChild(el("div","sub","Noch nichts verkauft."));
    }).catch(function(e){tot.textContent="";tot.appendChild(el("div","sub","Fortschritt nicht abrufbar ("+(e.message||"?")+")"));});}
  return c;
}
function draw(out,d,tab){
  out.textContent="";
  var trades=(d.trades||[]),runs=(d.runs||[]),watch=(d.watch||[]);
  var act=trades.filter(function(t){return t.status!=="done";}),done=trades.filter(function(t){return t.status==="done";});
  var ractive=runs.filter(function(r){return r.status!=="done";});
  var hdr=el("div","row");hdr.style.cssText="margin:10px 0;flex-wrap:wrap";
  [["act","Trades ("+act.length+")"],["run","Läufe ("+ractive.length+")"],["watch","Merkliste ("+watch.length+")"],["done","Erledigt ("+done.length+")"]].forEach(function(t){var b=el("button",t[0]===tab?"":"ghost",t[1]);b.style.cssText="flex:1;padding:8px 4px;min-height:40px";b.onclick=function(){draw(out,d,t[0]);};hdr.appendChild(b);});
  out.appendChild(hdr);
  var list=tab==="act"?act:tab==="done"?done.slice(0,40):[];
  if(tab==="act"||tab==="done"||tab==="run"){
    /* Kopfzeile wie im Overlay: aktiv · überboten · geplant netto; Werkzeuge: alle auf/zu, Größe */
    var plan=(tab==="run"?[]:list).reduce(function(a,t){return a+(t.unit>0&&t.qty>0?t.unit*t.qty:0);},0);
    var st=el("div","row");st.style.cssText="flex-wrap:wrap;gap:6px 12px;margin:4px 0 8px";
    var cnt=el("span","sub",(tab==="run"?ractive.length:list.length)+" aktiv");st.appendChild(cnt);
    var ob=el("span","sub","");ob.id="wl-ob";st.appendChild(ob);
    if(plan)st.appendChild(el("span","sub","geplant netto "+sg(plan)+" ISK ("+M.short(plan)+")"));
    out.appendChild(st);
    var tools=el("div","row");tools.style.cssText="gap:6px;margin-bottom:8px;flex-wrap:wrap";
    function tb(txt,fn,id){var b=el("button","ghost",txt);b.style.cssText="min-height:34px;padding:2px 12px;font-size:13px";if(id)b.id=id;b.onclick=fn;tools.appendChild(b);return b;}
    function toggleAll(on){EXP.all=on;out.querySelectorAll(".wl-det").forEach(function(x){x.style.display=on?"":"none";});}
    tb("alle auf",function(){toggleAll(true);},"wl-open");tb("alle zu",function(){toggleAll(false);},"wl-close");
    if(tab!=="run"){var sel=document.createElement("select");sel.id="wl-sort";sel.style.cssText="min-height:34px;padding:2px 8px;border-radius:8px;border:1px solid var(--ln);background:var(--sf2);color:var(--fg);font:inherit;font-size:13px";
      [["date","Datum"],["profit","Gewinn"],["name","Name"],["place","Ort"],["status","Status"]].forEach(function(o){var op=document.createElement("option");op.value=o[0];op.textContent=o[1];if(o[0]===SORT)op.selected=true;sel.appendChild(op);});
      sel.onchange=function(){SORT=sel.value;draw(out,d,tab);};var sl=el("span","sub","Sortieren");tools.appendChild(sl);tools.appendChild(sel);}
    var lab=el("span","sub","Größe");lab.style.marginLeft="auto";tools.appendChild(lab);
    var wrap=el("div");wrap.style.cssText="transform-origin:top left";
    function applySize(){var z=sizeGet();wrap.style.zoom=z;}
    tb("A−",function(){var z=Math.max(0.8,Math.round((sizeGet()-0.1)*10)/10);lsSet("eve-omni-m-wl-size",String(z));applySize();},"wl-small");tb("A+",function(){var z=Math.min(1.4,Math.round((sizeGet()+0.1)*10)/10);lsSet("eve-omni-m-wl-size",String(z));applySize();},"wl-big");
    out.appendChild(tools);out.appendChild(wrap);applySize();
    if(tab==="run"){ractive.forEach(function(r){wrap.appendChild(runCard(r));});if(!ractive.length)wrap.appendChild(el("p","msg","Keine aktiven Läufe."));}
    else{list=sortList(list);list.forEach(function(t){wrap.appendChild(tradeCard(t));});if(!list.length)wrap.appendChild(el("p","msg","Keine Trades."));
      var lost=0,pend=0;list.forEach(function(t){if(t._chk){pend++;t._chk(function(l){if(l)lost++;pend--;ob.textContent=lost?lost+" überboten":"";ob.style.color=lost?"var(--gd,#e0a030)":"";ob.style.fontWeight="700";});}});}
  }
  if(tab==="watch"){var c=el("div","card");watch.forEach(function(w){var r=el("div","row");r.appendChild(el("div","grow",w.name));c.appendChild(r);});if(!watch.length)c.appendChild(el("div","sub","Die Preis-Merkliste ist leer."));out.appendChild(c);}
}
M.tradeGoals=async function(){
  var d=cached(),out=[];if(!d||!d.data)return out;TX={};
  var tr=(d.data.trades||[]).filter(function(t){return t.status!=="done"&&t.qty>0;});
  for(var i=0;i<tr.length;i++){var t=tr[i],ch=charFor(t.charId,t.charName);if(!ch||!M.hasScope(ch,"esi-wallet.read_character_wallet.v1"))continue;
    try{var k=calc(await getTx(ch),t.tid,sinceOf(t.created),{tax:0,broker:0},0);if(k.s>=t.qty)out.push({key:"goal:"+t.id,name:t.name,qty:t.qty});}catch(e){}}
  return out;
};
/* Einstellungen › Abgleich mit dem PC: Code + Server speichern/trennen (gleicher Speicher wie die Watchlist) */
M.syncCard=function(){
  var cf=cfg(),c=el("div","card");c.id="sync-opt";c.appendChild(el("div","nm","Abgleich mit dem PC"));
  var st=el("div","sub",cf.code&&S.validCode(cf.code)?"Verbunden · Code …"+cf.code.slice(-5):"Nicht verbunden. Den Code zeigt EVE Omni am PC unter Einstellungen › Daten › „Mit Handy abgleichen“.");c.appendChild(st);
  function f(label,v,ph){var l=el("div","sub",label);l.style.marginTop="8px";c.appendChild(l);var i=el("input");i.type="text";i.value=v||"";i.placeholder=ph;i.autocomplete="off";i.spellcheck=false;i.style.cssText="width:100%;padding:10px;border-radius:8px;border:1px solid var(--ln);background:var(--sf2);color:var(--fg);font:inherit";c.appendChild(i);return i;}
  var ci=f("Sync-Code",cf.code,"XXXXX-XXXXX-XXXXX-XXXXX");ci.id="set-sync-code";ci.style.textTransform="uppercase";ci.autocapitalize="characters";
  var ui=f("Server",cf.url||DEFAULT_URL,DEFAULT_URL);ui.id="set-sync-url";ui.autocapitalize="none";
  var r=el("div","row");r.style.cssText="gap:8px;margin-top:10px";var sv=el("button","","Speichern");sv.id="set-sync-save";sv.style.flex="1";var tr=el("button","ghost","Trennen");tr.id="set-sync-off";tr.style.flex="1";r.appendChild(sv);r.appendChild(tr);c.appendChild(r);
  var msg=el("p","msg","");c.appendChild(msg);
  sv.onclick=function(){var code=ci.value.trim(),url=ui.value.trim()||DEFAULT_URL;
    if(code&&!S.validCode(code)){msg.className="msg bad";msg.textContent="Der Code ist nicht gültig (20 Zeichen, Buchstaben und Ziffern).";return;}
    var old=cfg().code||"",nc=code?S.normalize(code).replace(/(.{5})(?=.)/g,"$1-"):"";if(nc!==old)lsSet(DATA,"");
    saveCfg(nc?{code:nc,url:url}:{url:url});msg.className="msg";msg.textContent=nc?"Gespeichert. Die Watchlist holt den Stand beim nächsten Öffnen.":"Gespeichert (ohne Code).";
    st.textContent=nc?"Verbunden · Code …"+nc.slice(-5):"Nicht verbunden.";};
  tr.onclick=function(){saveCfg({url:ui.value.trim()||DEFAULT_URL});lsSet(DATA,"");ci.value="";msg.className="msg";msg.textContent="Getrennt. Der Code ist auf diesem Handy gelöscht.";st.textContent="Nicht verbunden.";};
  return c;
};
M.VIEWS.sync=async function(sec){
  M.head(sec,"Watchlist vom PC","more");
  var cf=cfg(),box=el("div","card");sec.appendChild(box);
  var out=el("div");sec.appendChild(out);var msg=el("p","msg","");sec.appendChild(msg);
  function field(label,val,ph){var l=el("div","sub",label);l.style.marginTop="8px";box.appendChild(l);var i=el("input");i.type="text";i.value=val||"";i.placeholder=ph||"";i.autocapitalize="characters";i.autocomplete="off";i.spellcheck=false;i.style.cssText="width:100%;box-sizing:border-box;padding:10px;font-size:16px;border-radius:8px;border:1px solid var(--ln);background:var(--sf2);color:var(--fg)";box.appendChild(i);return i;}
  var sum=el("div","row");sum.style.display="none";box.appendChild(sum);var form=el("div");box.appendChild(form);var realBox=box;box=form;
  function collapse(on){form.style.display=on?"none":"";sum.style.display=on?"flex":"none";}
  box.appendChild(el("div","nm","Sync-Code"));
  var note=el("div","sub","Den Code zeigt EVE Omni am PC unter Einstellungen › Daten › „Mit Handy abgleichen“. Der Code bleibt nur auf deinen Geräten.");box.appendChild(note);
  var ci=field("Code",cf.code,"XXXXX-XXXXX-XXXXX-XXXXX");ci.id="sync-code";ci.style.textTransform="uppercase";
  var ui=field("Server",cf.url||DEFAULT_URL,DEFAULT_URL);ui.id="sync-url";ui.autocapitalize="none";
  var b=el("button","","Speichern und laden");b.id="sync-go";b.style.cssText="width:100%;margin-top:10px";box.appendChild(b);
  async function load(){
    var code=ci.value.trim(),url=ui.value.trim()||DEFAULT_URL;
    if(!S.validCode(code)){msg.className="msg bad";msg.textContent="Der Code ist nicht gültig (20 Zeichen, Buchstaben und Ziffern).";return;}
    TX={};FEE={};ORD={};saveCfg({code:S.normalize(code).replace(/(.{5})(?=.)/g,"$1-"),url:url});msg.className="msg";msg.textContent="Lade …";
    try{
      var r=await S.pull(url,code);
      if(!r){msg.className="msg bad";msg.textContent="Auf dem Server liegt zu diesem Code noch nichts. Am PC „Jetzt senden“ drücken.";return;}
      lsSet(DATA,JSON.stringify({data:r.data,v:r.v,t:r.t,got:Date.now()}));
      draw(out,r.data,"act");msg.textContent="Stand vom PC: "+when(r.data.t||r.t)+" · abgerufen "+M.now();summary(when(r.data.t||r.t));collapse(true);
    }catch(e){msg.className="msg bad";msg.textContent="Abgleich ging nicht: "+(e.name==="OperationError"?"Der Code passt nicht zu den Daten.":e.message);}
  }
  var tr=el("button","ghost","Trennen");tr.id="sync-off";tr.style.cssText="width:100%;margin-top:8px";tr.onclick=function(){saveCfg({url:ui.value.trim()||DEFAULT_URL});lsSet(DATA,"");ci.value="";out.textContent="";msg.textContent="Getrennt. Der Code ist auf diesem Handy gelöscht.";msg.className="msg";collapse(false);};box.appendChild(tr);
  var sg=el("div","grow sub","");sum.appendChild(sg);var ch=el("button","ghost","Ändern");ch.id="sync-edit";ch.style.cssText="min-height:36px;padding:4px 12px";ch.onclick=function(){collapse(false);};sum.appendChild(ch);
  function summary(t){var c=cfg().code||"";sg.textContent="Verbunden · Code …"+c.slice(-5)+(t?" · Stand "+t:"");}
  b.onclick=load;
  var c=cached();
  if(c&&c.data){draw(out,c.data,"act");if(cf.code&&S.validCode(cf.code)){summary(when(c.data.t||c.t));collapse(true);}msg.textContent="Gespeicherter Stand vom PC: "+when(c.data.t||c.t)+" (abgerufen am "+when(c.got)+")";}
  if(cf.code&&S.validCode(cf.code))load();
};
})();

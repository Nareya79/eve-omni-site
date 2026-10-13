/* EVEOmni Mobile – Abgleich vom PC (M4): Meine Trades, Hauling-Läufe, Preis-Merkliste. Nur lesen: der PC ist die Quelle.
   Daten liegen verschlüsselt auf dem Sync-Server (Unraid); Code und Schlüssel verlassen das Gerät nie. */
(function(){
"use strict";
var M=window.OmniM,el=M.el,exact=M.exact,short=M.short,lsGet=M.lsGet,lsSet=M.lsSet,S=window.OmniSync;
var KEY="eve-omni-m-sync",DATA="eve-omni-m-sync-data",DEFAULT_URL="https://fluxserver01.taileafff1.ts.net:8443/sync-omni";
function cfg(){try{return JSON.parse(lsGet(KEY))||{};}catch(e){return {};}}
function saveCfg(o){lsSet(KEY,JSON.stringify(o));}
function cached(){try{return JSON.parse(lsGet(DATA));}catch(e){return null;}}
function when(t){return new Date(t).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}
function priceTxt(p){return M.priceTxt(p);}
function de2(n){var f=(Math.round(Math.abs(n)*100)/100).toFixed(2).split(".");f[0]=f[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");return (n<0?"-":"")+f[0]+(f[1]==="00"?"":","+f[1]);}
function priceRow(card,label,p){if(!(p>0))return;var r=el("div","row");r.style.marginTop="6px";r.appendChild(el("div","grow sub",label));var v=el("div","isk",de2(p)+" ISK");r.appendChild(v);var b=el("button","ghost","Kopieren");b.style.cssText="min-height:36px;padding:4px 10px";b.setAttribute("data-copy",priceTxt(p));b.onclick=function(){M.copy(priceTxt(p),b);};r.appendChild(b);card.appendChild(r);}
var HUBN={jita:"Jita",amarr:"Amarr",dodixie:"Dodixie",rens:"Rens",hek:"Hek"};
function tradeCard(t){
  var c=el("div","card"),r=el("div","row"),g=el("div","grow");g.appendChild(el("div","nm",t.name+" ×"+exact(t.qty||0)));
  g.appendChild(el("div","sub",(HUBN[t.hub]||t.stName||t.hub||"")+(t.charName?" · "+t.charName:"")+" · "+(t.status==="done"?"erledigt":t.buyDone?"gekauft, verkaufen":"einkaufen")));r.appendChild(g);
  if(t.margin!=null&&isFinite(t.margin)){var m=el("div","isk",(Math.round(t.margin*10)/10).toString().replace(".",",")+" %");m.appendChild(el("small","","Marge"));r.appendChild(m);}
  c.appendChild(r);
  priceRow(c,"Kaufen zu (Plan)",t.buy);priceRow(c,"Verkaufen zu (Plan)",t.sell);
  if(t.unit>0&&t.qty>0){var n=el("div","sub","Plan netto: "+de2(t.unit)+" ISK pro Stück · "+de2(t.unit*t.qty)+" ISK gesamt");n.style.marginTop="6px";c.appendChild(n);}
  return c;
}
function runCard(r){
  var c=el("div","card"),row=el("div","row"),g=el("div","grow");g.appendChild(el("div","nm","Lauf nach "+String(r.toName||"?").split(" - ")[0]));
  g.appendChild(el("div","sub",(r.charName||"")+" · "+(r.items||[]).length+" Waren · "+(r.status==="done"?"erledigt":r.buyDone?"unterwegs/verkaufen":"einkaufen")));row.appendChild(g);c.appendChild(row);
  (r.items||[]).slice(0,12).forEach(function(i){var x=el("div","row");x.appendChild(el("div","grow sub",i.name));x.appendChild(el("div","isk",exact(i.q||0)));c.appendChild(x);});
  if((r.items||[]).length>12)c.appendChild(el("div","sub","… und "+((r.items||[]).length-12)+" weitere"));
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
  if(tab==="act"||tab==="done"){list.forEach(function(t){out.appendChild(tradeCard(t));});if(!list.length)out.appendChild(el("p","msg","Keine Trades."));}
  if(tab==="run"){ractive.forEach(function(r){out.appendChild(runCard(r));});if(!ractive.length)out.appendChild(el("p","msg","Keine aktiven Läufe."));}
  if(tab==="watch"){var c=el("div","card");watch.forEach(function(w){var r=el("div","row");r.appendChild(el("div","grow",w.name));c.appendChild(r);});if(!watch.length)c.appendChild(el("div","sub","Die Preis-Merkliste ist leer."));out.appendChild(c);}
}
M.VIEWS.sync=async function(sec){
  M.head(sec,"Trades vom PC","more");
  var cf=cfg(),box=el("div","card");sec.appendChild(box);
  var out=el("div");sec.appendChild(out);var msg=el("p","msg","");sec.appendChild(msg);
  function field(label,val,ph){var l=el("div","sub",label);l.style.marginTop="8px";box.appendChild(l);var i=el("input");i.type="text";i.value=val||"";i.placeholder=ph||"";i.autocapitalize="characters";i.autocomplete="off";i.spellcheck=false;i.style.cssText="width:100%;box-sizing:border-box;padding:10px;font-size:16px;border-radius:8px;border:1px solid var(--ln);background:var(--sf2);color:var(--fg)";box.appendChild(i);return i;}
  box.appendChild(el("div","nm","Sync-Code"));
  var note=el("div","sub","Den Code zeigt EVE Omni am PC unter Einstellungen › Daten › „Mit Handy abgleichen“. Der Code bleibt nur auf deinen Geräten.");box.appendChild(note);
  var ci=field("Code",cf.code,"XXXXX-XXXXX-XXXXX-XXXXX");ci.id="sync-code";ci.style.textTransform="uppercase";
  var ui=field("Server",cf.url||DEFAULT_URL,DEFAULT_URL);ui.id="sync-url";ui.autocapitalize="none";
  var b=el("button","","Speichern und laden");b.id="sync-go";b.style.cssText="width:100%;margin-top:10px";box.appendChild(b);
  async function load(){
    var code=ci.value.trim(),url=ui.value.trim()||DEFAULT_URL;
    if(!S.validCode(code)){msg.className="msg bad";msg.textContent="Der Code ist nicht gültig (20 Zeichen, Buchstaben und Ziffern).";return;}
    saveCfg({code:S.normalize(code).replace(/(.{5})(?=.)/g,"$1-"),url:url});msg.className="msg";msg.textContent="Lade …";
    try{
      var r=await S.pull(url,code);
      if(!r){msg.className="msg bad";msg.textContent="Auf dem Server liegt zu diesem Code noch nichts. Am PC „Jetzt senden“ drücken.";return;}
      lsSet(DATA,JSON.stringify({data:r.data,v:r.v,t:r.t,got:Date.now()}));
      draw(out,r.data,"act");msg.textContent="Stand vom PC: "+when(r.data.t||r.t)+" · abgerufen "+M.now();
    }catch(e){msg.className="msg bad";msg.textContent="Abgleich ging nicht: "+(e.name==="OperationError"?"Der Code passt nicht zu den Daten.":e.message);}
  }
  b.onclick=load;
  var c=cached();
  if(c&&c.data){draw(out,c.data,"act");msg.textContent="Gespeicherter Stand vom PC: "+when(c.data.t||c.t)+" (Handy hat ihn am "+when(c.got)+" geholt)";}
  if(cf.code&&S.validCode(cf.code))load();
};
})();

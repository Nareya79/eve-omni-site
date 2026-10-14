/* EVEOmni Mobile 1.0.4 – Wallet › Analyse (Vorlage: Mockup von The_Illusi0nist, Logik wie Desktop Wallet › Auswertung).
   Daten frisch über ESI (Transaktionen, Journal, Kontostand, Orders) und lokal gesammelt in eve-omni-m-wa-v1, weil ESI nur ~30 Tage liefert –
   so wachsen 30/90 Tage und die Vergleiche mit der Zeit. Gewinne netto: FIFO je Charakter, Verkaufssteuer aus den Skills, Maklergebühren aus dem Journal. */
(function(){
"use strict";
var M=window.OmniM;if(!M)return;
var T=function(de,en){return M.I18.en?en:de;};   // ganze Sätze je Sprache (der Wort-Übersetzer würde Sätze mit Zahlen zerstückeln)
var el=M.el,short=M.short,esi=M.esi,esiRaw=M.esiRaw,names=M.names,nm=M.nm,hasScope=M.hasScope,I18=M.I18;
var KEY="eve-omni-m-wa-v1",VKEY="eve-omni-m-wa-view",DAY=864e5,KEEP=400*DAY,MAXN=8000;
var SRC=[["trade",T("Station-Trading","Station trading"),"#3987e5"],["haul","Hauling","#1fae7a"],["own",T("Verkauf ohne Einkauf","Sales without purchase"),"#9085e9"],["other",T("Sonstiges","Other"),"#8a8f98"],["broker","Broker","#e8743b"]];
var busy=false,err="";
function load(){var s=null;try{s=JSON.parse(M.lsGet(KEY));}catch(e){}return s&&s.c?s:{c:{}};}
function save(s){try{M.lsSet(KEY,JSON.stringify(s));}catch(e){err=T("Speicher voll – ältere Analyse-Daten werden nicht behalten.","Storage full – older analysis data is not kept.");}}
function vLoad(){var v={};try{v=JSON.parse(M.lsGet(VKEY))||{};}catch(e){}v.mode=["one","all","multi"].indexOf(v.mode)>=0?v.mode:"one";v.days=[7,30,90].indexOf(v.days)>=0?v.days:7;v.ids=Array.isArray(v.ids)?v.ids:[];return v;}
function vSave(v){M.lsSet(VKEY,JSON.stringify(v));}
function sel(v){var all=M.loadChars();if(v.mode==="all")return all;if(v.mode==="multi"){var l=all.filter(function(c){return v.ids.indexOf(c.character_id)>=0;});return l.length?l:[M.activeChar()];}var one=all.filter(function(c){return c.character_id===v.one;})[0];return [one||M.activeChar()];}
// Journal → Quelle (Markt steht in den Transaktionen, Überweisungen/Verträge sind kein Gewinn) – wie waJrCat am PC, Kurier/Kopfgeld/PI/Rest = „Sonstiges“
function jrSrc(r){r=String(r||"");if(r==="brokers_fee")return "broker";if(/^(market_|transaction_tax$|player_donation$|player_trading$|corporation_account_withdrawal$|corporation_payment$|contract_price|contract_deposit|contract_brokers_fee)/.test(r))return "";return "other";}
/* ---------- Abruf: alles Neue in den Speicher (doppelte über die Id) ---------- */
async function fetchChar(s,c){
  var id=c.character_id,d=s.c[id]||(s.c[id]={tx:{},jr:{},t0:Date.now()}),now=Date.now();
  if(!hasScope(c,"esi-wallet.read_character_wallet.v1"))throw new Error(c.character_name+T(": Berechtigung fehlt – neu einloggen.",": permission missing – log in again."));
  var tx=await esi(c,"/characters/"+id+"/wallet/transactions/");
  tx.forEach(function(t){d.tx[t.transaction_id]=[Date.parse(t.date),t.type_id,t.quantity,t.unit_price,t.is_buy?1:0,t.location_id];});
  var r=await esiRaw(c,"/characters/"+id+"/wallet/journal/"),jr=await r.json(),pg=Math.min(r.pages||1,5);
  for(var i=2;i<=pg;i++){try{jr=jr.concat(await (await esiRaw(c,"/characters/"+id+"/wallet/journal/?page="+i)).json());}catch(e){break;}}
  jr.forEach(function(j){d.jr[j.id]=[Date.parse(j.date),j.ref_type,j.amount||0];});
  var first=Math.min.apply(null,tx.map(function(t){return Date.parse(t.date);}).concat(jr.map(function(j){return Date.parse(j.date);}),[now]));
  d.t0=Math.min(d.t0||now,first);   // ab hier sind Daten vollständig
  d.bal=await esi(c,"/characters/"+id+"/wallet/");
  d.sell=0;d.esc=0;
  if(hasScope(c,"esi-markets.read_character_orders.v1")){try{(await esi(c,"/characters/"+id+"/orders/")).forEach(function(o){if(o.is_buy_order)d.esc+=o.escrow||0;else d.sell+=o.price*o.volume_remain;});}catch(e){}}
  try{d.tax=(await M.fees(c)).tax;}catch(e){d.tax=d.tax||0.0337;}
  // aufräumen: älter als 400 Tage raus, höchstens 8000 je Art
  ["tx","jr"].forEach(function(k){var o=d[k],ks=Object.keys(o).filter(function(x){if(now-o[x][0]>KEEP){delete o[x];return false;}return true;});if(ks.length>MAXN)ks.sort(function(a,b){return o[a][0]-o[b][0];}).slice(0,ks.length-MAXN).forEach(function(x){delete o[x];});});
  d.t=now;
}
async function refresh(v){
  if(busy)return;busy=true;err="";again();
  var s=load(),bad=[];
  for(var c of sel(v)){try{await fetchChar(s,c);}catch(e){bad.push(e.message);}}
  save(s);busy=false;if(bad.length)err=bad.join(" · ");again();
}
function again(){var x=document.getElementById("v-wa");if(x&&!x.hidden)M.show("wa");}
/* ---------- Rechnen: FIFO je Charakter über alles Gespeicherte, dann Zeiträume ---------- */
function sales(d){
  var tx=Object.keys(d.tx).map(function(k){return d.tx[k];}).sort(function(a,b){return a[0]-b[0];}),lots={},out=[];
  tx.forEach(function(t){
    if(t[4]){(lots[t[1]]=lots[t[1]]||[]).push({t:t[0],q:t[2],p:t[3],loc:t[5]});return;}
    var need=t[2],l=lots[t[1]]||[],m=0,cost=0,hold=0,haul=0;
    while(need>0&&l.length){var a=l[0],u=Math.min(a.q,need);m+=u;cost+=u*a.p;hold+=u*(t[0]-a.t);if(a.loc!==t[5])haul+=u;need-=u;a.q-=u;if(a.q<=0)l.shift();}
    out.push({t:t[0],type:t[1],q:t[2],rev:t[2]*t[3],m:m,cost:cost,hold:hold,haul:haul,p:t[3]});
  });
  return out;
}
function compute(chars,days,now){
  var s=load(),to=now,from=now-days*DAY,pfrom=from-days*DAY,nb=days>30?Math.ceil(days/7):days,bw=(to-from)/nb;
  function blank(){var o={net:0,rev:0,n:0,cost:0,src:{}};SRC.forEach(function(x){o.src[x[0]]=0;});return o;}
  var cur=blank(),prev=blank(),items={},bars=[],cov=Infinity,cap=0,any=false;
  for(var i=0;i<nb;i++){var b={};SRC.forEach(function(x){b[x[0]]=0;});bars.push(b);}
  function add(o,src,v,t){o.src[src]+=v;o.net+=v;if(o===cur){var k=Math.min(nb-1,Math.floor((t-from)/bw));bars[k][src]+=v;}}
  chars.forEach(function(c){
    var d=s.c[c.character_id];if(!d)return;any=true;cov=Math.min(cov,d.t0||now);cap+=(d.bal||0)+(d.sell||0)+(d.esc||0);
    var tax=d.tax||0.0337;
    sales(d).forEach(function(x){
      var o=x.t>=from&&x.t<to?cur:x.t>=pfrom&&x.t<from?prev:null;if(!o)return;
      o.rev+=x.rev;o.n++;
      var per=x.rev/x.q,mRev=x.m*per,tx=x.rev*tax,mNet=mRev-x.cost-x.m*per*tax,own=(x.q-x.m)*per*(1-tax);
      o.cost+=tx;
      if(x.m){var hShare=x.haul/x.m;add(o,"haul",mNet*hShare,x.t);add(o,"trade",mNet*(1-hShare),x.t);}
      if(own)add(o,"own",own,x.t);
      if(o===cur){var it=items[x.type]||(items[x.type]={type:x.type,prof:0,hold:0,hq:0});it.prof+=mNet+own;if(x.m){it.hold+=x.hold;it.hq+=x.m;}}
    });
    Object.keys(d.jr).forEach(function(k){
      var j=d.jr[k],o=j[0]>=from&&j[0]<to?cur:j[0]>=pfrom&&j[0]<from?prev:null,src=jrSrc(j[1]);if(!o||!src)return;
      add(o,src,j[2],j[0]);if(src==="broker")o.cost+=-j[2];
    });
  });
  var list=Object.keys(items).map(function(k){return items[k];});
  return {cur:cur,prev:prev,bars:bars,from:from,to:to,bw:bw,cap:cap,any:any,cov:cov===Infinity?now:cov,
    top:list.filter(function(x){return x.prof>0;}).sort(function(a,b){return b.prof-a.prof;}).slice(0,10),
    worst:list.filter(function(x){return x.prof<0;}).sort(function(a,b){return a.prof-b.prof;}).slice(0,5),
    hasPrev:cov!==Infinity&&cov<=pfrom+DAY,full:cov!==Infinity&&cov<=from+DAY};
}
/* ---------- Anzeige ---------- */
function fmtPct(x){var a=Math.round(Math.abs(x)*10)/10,i=Math.floor(a),d=Math.round((a-i)*10);return (x>0?"+":x<0?"-":"")+I18.int(i)+(d?I18.dec+d:"")+" %";}
function trend(c,p,good){   // good: 1 = mehr ist gut, -1 = weniger ist gut
  if(!p)return el("span","wa-tr","–");
  var ch=(c-p)/Math.abs(p)*100,up=ch>=0,e=el("span","wa-tr "+((up?1:-1)*good>0?"ok":"bad"),(up?"▲ ":"▼ ")+fmtPct(ch));return e;
}
function hold(ms){var m=Math.round(ms/60000);if(m<60)return Math.max(1,m)+" min";var h=Math.floor(m/60),H=T(" Std."," h");if(h<24)return h+H;return Math.floor(h/24)+T(" Tg. "," d ")+(h%24)+H;}
function tile(lab,val,cls,tr,tip){var t=el("div","wa-k");if(tip)t.title=tip;t.appendChild(el("div","wa-kl",lab));var v=el("div","wa-kv "+(cls||""),val);t.appendChild(v);if(tr)t.appendChild(tr);return t;}
function chart(r,days){
  var W=340,H=110,n=r.bars.length,gap=n>20?1:3,bw=(W-gap*(n-1))/n,pos=r.bars.map(function(b){var p=0;SRC.forEach(function(x){if(b[x[0]]>0)p+=b[x[0]];});return p;}),
    neg=r.bars.map(function(b){var p=0;SRC.forEach(function(x){if(b[x[0]]<0)p-=b[x[0]];});return p;}),mx=Math.max.apply(null,pos.concat([1])),mn=Math.max.apply(null,neg.concat([0])),
    z=H*mx/(mx+mn),sc=z/mx,svg='<svg class="wa-ch" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="'+T("Netto-Gewinn nach Quelle","Net profit by source")+'">';
  r.bars.forEach(function(b,i){var x=i*(bw+gap),up=z,dn=z;
    SRC.forEach(function(s){var v=b[s[0]];if(!v)return;var h=Math.abs(v)*sc;if(v>0){up-=h;svg+='<rect x="'+x.toFixed(1)+'" y="'+up.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+s[2]+'"/>';}else{svg+='<rect x="'+x.toFixed(1)+'" y="'+dn.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+s[2]+'"/>';dn+=h;}});});
  var pts=r.bars.map(function(b,i){var net=0;SRC.forEach(function(s){net+=b[s[0]];});return ((i+0.5)*(bw+gap)).toFixed(1)+","+(z-net*sc).toFixed(1);}).join(" ");
  svg+='<line x1="0" x2="'+W+'" y1="'+z.toFixed(1)+'" y2="'+z.toFixed(1)+'" class="wa-z"/><polyline points="'+pts+'" class="wa-line"/></svg>';
  var box=el("div","wa-chw");box.innerHTML=svg;
  var ax=el("div","wa-ax");var f=function(t){return new Date(t).toLocaleDateString(I18.loc,{day:"2-digit",month:"2-digit"});};ax.appendChild(el("span","",f(r.from+r.bw/2)));ax.appendChild(el("span","",f(r.to-r.bw/2)));box.appendChild(ax);
  return {box:box,max:mx};
}
function items(sec,title,list,good){
  var card=el("div","card wa-card");var h=el("div","wa-ih");h.appendChild(el("b","grow",title));h.appendChild(el("span","wa-c1","Profit"));h.appendChild(el("span","wa-c2",T("Ø Haltezeit","Avg. hold")));card.appendChild(h);
  if(!list.length){card.appendChild(el("div","sub",good?T("Keine Ware mit Gewinn im Zeitraum.","No item with a profit in this period."):T("Keine Ware mit Verlust im Zeitraum.","No item with a loss in this period.")));sec.appendChild(card);return;}
  var mx=Math.max.apply(null,list.map(function(x){return Math.abs(x.prof);}));
  list.forEach(function(x){
    var r=el("div","wa-it"),img=el("img","wa-ic");img.src="https://images.evetech.net/types/"+x.type+"/icon?size=32";img.alt="";img.loading="lazy";r.appendChild(img);
    var mid=el("div","wa-mid");mid.appendChild(el("div","wa-nm",nm(x.type)));var bar=el("div","wa-bar"),fill=el("i",good?"ok":"bad");fill.style.width=Math.max(3,Math.abs(x.prof)/mx*100)+"%";bar.appendChild(fill);mid.appendChild(bar);r.appendChild(mid);
    r.appendChild(el("span","wa-c1 "+(good?"ok":"bad"),(x.prof>0?"+":"")+short(x.prof)+" ISK"));r.appendChild(el("span","wa-c2",x.hq?hold(x.hold/x.hq):"–"));card.appendChild(r);
  });
  sec.appendChild(card);
}
function tabs(sec,cur){var r=el("div","row wa-tabs");[["wallet",T("Übersicht","Overview")],["wa",T("Analyse","Analysis")]].forEach(function(t){var b=el("button",t[0]===cur?"":"ghost",t[1]);b.onclick=function(){M.show(t[0]);};r.appendChild(b);});var h=sec.querySelector("h2");sec.insertBefore(r,h?h.nextSibling:sec.firstChild);}
M.waTabs=tabs;
M.VIEWS.wa=async function(sec){
  var v=vLoad(),all=M.loadChars();
  var h2=el("h2","","Wallet");h2.setAttribute("data-keep","");sec.appendChild(h2);tabs(sec,"wa");
  // Charaktere: einzeln / alle / mehrere
  var mr=el("div","row wa-mode");[["one",T("Einzeln","Single")],["all",T("Alle","All")],["multi",T("Mehrere","Several")]].forEach(function(m){var b=el("button",v.mode===m[0]?"":"ghost",m[1]);b.onclick=function(){v.mode=m[0];vSave(v);M.show("wa");};mr.appendChild(b);});
  if(all.length>1)sec.appendChild(mr);
  if(all.length>1&&v.mode!=="all"){var cr=el("div","row wa-chars"),chosen=sel(v).map(function(c){return c.character_id;});
    all.forEach(function(c){var on=chosen.indexOf(c.character_id)>=0,b=el("button",on?"":"ghost",c.character_name);b.setAttribute("aria-pressed",on);b.onclick=function(){
      if(v.mode==="one")v.one=c.character_id;else{var l=chosen.slice(),i=l.indexOf(c.character_id);if(i>=0){if(l.length>1)l.splice(i,1);}else l.push(c.character_id);v.ids=l;}vSave(v);M.show("wa");};cr.appendChild(b);});
    sec.appendChild(cr);}
  // Zeitraum + Aktualisieren
  var tr=el("div","row wa-top"),ps=el("select","wa-per");[[7,T("Letzte 7 Tage","Last 7 days")],[30,T("Letzte 30 Tage","Last 30 days")],[90,T("Letzte 90 Tage","Last 90 days")]].forEach(function(p){var o=el("option","",p[1]);o.value=p[0];if(p[0]===v.days)o.selected=true;ps.appendChild(o);});
  ps.onchange=function(){v.days=Number(ps.value);vSave(v);M.show("wa");};ps.setAttribute("aria-label",T("Zeitraum","Period"));tr.appendChild(ps);
  var rb=el("button","ghost",busy?T("Lade …","Loading …"):T("⟳ Aktualisieren","⟳ Refresh"));rb.disabled=busy;rb.title=T("Transaktionen, Journal, Kontostand und Orders frisch von ESI laden","Load transactions, journal, balance and orders fresh from ESI");rb.onclick=function(){refresh(v);};tr.appendChild(rb);sec.appendChild(tr);
  if(err){var e=el("p","msg bad",err);sec.appendChild(e);}
  var chars=sel(v),s=load();
  if(!chars.some(function(c){return s.c[c.character_id];})){
    if(!busy){refresh(v);return;}
    sec.appendChild(el("p","msg",T("Lade Transaktionen und Journal …","Loading transactions and journal …")));return;
  }
  var r=compute(chars,v.days,Date.now()),C=r.cur,P=r.hasPrev?r.prev:null;
  if(!r.full){var have=Math.max(1,Math.round((Date.now()-r.cov)/DAY));sec.appendChild(el("p","msg wa-hint",T("Daten erst für "+have+" von "+v.days+" Tagen – EVE liefert nur rund 30 Tage, der Rest sammelt sich hier mit der Zeit.","Data for "+have+" of "+v.days+" days so far – EVE only delivers about 30 days, the rest builds up here over time.")));}
  else if(!r.hasPrev)sec.appendChild(el("p","msg wa-hint",T("Vergleich mit dem Zeitraum davor erscheint, sobald genug Tage gesammelt sind.","The comparison with the previous period appears once enough days are collected.")));
  var g=el("div","wa-kpi");
  g.appendChild(tile(T("Netto-Gewinn","Net profit"),(C.net>0?"+":"")+short(C.net)+" ISK",C.net>=0?"ok":"bad",trend(C.net,P&&P.net,1),T("Nach Steuer und Maklergebühren","After tax and broker fees")));
  g.appendChild(tile(T("Umsatz","Turnover"),short(C.rev)+" ISK","blue",trend(C.rev,P&&P.rev,1),T("Summe aller Verkäufe","Sum of all sales")));
  g.appendChild(tile(T("Verkäufe","Sales"),String(C.n),"blue",trend(C.n,P&&P.n,1),T("Anzahl Verkaufs-Transaktionen","Number of sell transactions")));
  g.appendChild(tile(T("Kosten","Cost"),short(C.cost)+" ISK","bad",trend(C.cost,P&&P.cost,-1),T("Verkaufssteuer + Maklergebühren","Sales tax + broker fees")));
  sec.appendChild(g);
  var g2=el("div","wa-kpi wa-kpi2");
  g2.appendChild(tile(T("Rendite","Return"),r.cap?fmtPct(C.net/r.cap*100).replace("+",""):"–",C.net>=0?"ok":"bad",null,T("Netto-Gewinn ÷ Kapital heute (Kontostand + Verkaufsorders + Treuhand, ohne Assets)","Net profit ÷ capital today (balance + sell orders + escrow, without assets)")));
  g2.appendChild(tile(T("Kapitalumschlag","Capital turnover"),r.cap?(C.rev/r.cap).toFixed(2).replace(".",I18.dec)+"×":"–","",null,T("Umsatz ÷ Kapital heute – wie oft das Kapital im Zeitraum umgesetzt wurde","Turnover ÷ capital today – how often the capital was turned over in the period")));
  sec.appendChild(g2);
  // Netto nach Quelle
  var cc=el("div","card wa-card");cc.appendChild(el("b","",T("Netto-Gewinn nach Quelle","Net profit by source")));var ch=chart(r,v.days);cc.appendChild(el("div","wa-max",short(ch.max)+" ISK"));cc.appendChild(ch.box);
  var lg=el("div","wa-lg"),tot=SRC.reduce(function(a,x){return a+Math.abs(C.src[x[0]]);},0)||1;
  SRC.forEach(function(x){var it=el("div","wa-li"),dot=el("i","");dot.style.background=x[2];it.appendChild(dot);var tx=el("div","");tx.appendChild(el("div","wa-ln",x[1]));
    var val=el("div","wa-lv",(C.src[x[0]]>0?"+":"")+short(C.src[x[0]])+" ISK · "+Math.round(Math.abs(C.src[x[0]])/tot*100)+" %");if(P&&P.src[x[0]]){val.appendChild(document.createTextNode(" "));val.appendChild(trend(C.src[x[0]],P.src[x[0]],1));}tx.appendChild(val);it.appendChild(tx);lg.appendChild(it);});
  cc.appendChild(lg);cc.appendChild(el("div","sub wa-note",T("Säulen = Netto je "+(v.days>30?"Woche":"Tag")+" nach Quelle · Linie = Netto gesamt","Bars = net per "+(v.days>30?"week":"day")+" by source · line = total net")));sec.appendChild(cc);
  await names(r.top.concat(r.worst).map(function(x){return x.type;}));
  items(sec,T("Beste Waren","Top items"),r.top,true);items(sec,T("Schlechteste Waren","Worst items"),r.worst,false);
  var last=Math.max.apply(null,chars.map(function(c){return (s.c[c.character_id]||{}).t||0;}));
  sec.appendChild(el("p","msg",T("Gewinn netto: Einkauf zuerst (FIFO), minus Verkaufssteuer und Maklergebühren. „Sonstiges“ = Kopfgeld, Kurier, PI und übrige Buchungen. Stand ","Net profit: first in, first out (FIFO), minus sales tax and broker fees. “Other” = bounties, courier, PI and other entries. As of ")+new Date(last).toLocaleString(I18.loc,{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})));
};
// Reiter auch in der Übersicht (statische Wallet-Seite aus index.html) und „Wallet“ in der Leiste bleibt markiert
(function(){var w=document.getElementById("v-wallet");if(w&&!w.querySelector(".wa-tabs"))tabs(w,"wallet");})();
if(M.TABOF)M.TABOF.wa="wallet";
M.waCompute=compute;M.waSales=sales;   // für Tests
})();

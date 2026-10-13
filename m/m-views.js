/* EVEOmni Mobile – weitere Ansichten (nur lesen): Wallet-Details, Skill-Warteschlange, Assets, Gewinne, Route,
   Wertschätzer, Planeten, Industrie/Verträge. Nutzt die Hilfen aus m.js (window.OmniM). */
(function(){
"use strict";
var M=window.OmniM,el=M.el,exact=M.exact,short=M.short,esi=M.esi,pub=M.pub,esiRaw=M.esiRaw,names=M.names,nm=M.nm,fmtDur=M.fmtDur,hasScope=M.hasScope;
function charById(id){var a=M.loadChars();for(var i=0;i<a.length;i++)if(a[i].character_id===String(id))return a[i];return a[0];}
function head(sec,title,back){
  var h=el("div","row");var b=el("button","ghost","‹");b.style.cssText="min-height:40px;padding:4px 14px";b.setAttribute("aria-label","Zurück");b.onclick=function(){M.show(back||"more");};
  h.appendChild(b);var t=el("h2","grow",title);t.style.margin="0";t.style.textTransform="none";h.appendChild(t);sec.appendChild(h);return h;
}
M.head=head;
function msgEl(sec){var m=el("p","msg","");sec.appendChild(m);return m;}
function when(s){return new Date(s).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});}
function sgn(n){return (n>0?"+":"")+exact(n);}
function pct(x){return (Math.round(x*100000)/1000).toString().replace(".",",")+" %";}
function sgn2(n){var v=(Math.round(n*100)/100).toFixed(2).replace(".",",");return (n>0?"+":"")+v;}
function tabs(sec,list,cur,on){var r=el("div","row");r.style.margin="10px 0";list.forEach(function(t){var b=el("button",t[0]===cur?"":"ghost",t[1]);b.style.cssText="flex:1;padding:8px 4px;min-height:40px";b.onclick=function(){on(t[0]);};r.appendChild(b);});sec.appendChild(r);}
function chip(sec,cur,on){var all=M.loadChars();if(all.length<2)return;var r=el("div","row");r.style.cssText="margin:8px 0;flex-wrap:wrap";all.forEach(function(c){var b=el("button",c.character_id===cur?"":"ghost",c.character_name);b.style.cssText="padding:6px 12px;min-height:36px;font-weight:600";b.onclick=function(){on(c.character_id);};r.appendChild(b);});sec.appendChild(r);}
async function allPages(c,path,maxPages){var r=await esiRaw(c,path),out=await r.json(),p=Math.min(r.pages,maxPages||5);
  for(var i=2;i<=p;i++){var q=await esiRaw(c,path+(path.indexOf("?")>=0?"&":"?")+"page="+i);out=out.concat(await q.json());}return out;}
var REF={market_transaction:"Markt",transaction_tax:"Verkaufssteuer",brokers_fee:"Maklergebühr",market_escrow:"Marktauftrag (Treuhand)",player_trading:"Handel Spieler",player_donation:"Spende",bounty_prizes:"Kopfgeld",bounty_prize:"Kopfgeld",contract_price:"Vertrag",contract_reward:"Vertragsbelohnung",contract_collateral:"Vertragspfand",contract_brokers_fee:"Vertragsgebühr",industry_job_tax:"Industriesteuer",manufacturing:"Herstellung",insurance:"Versicherung",corporation_account_withdrawal:"Corp-Entnahme",office_rental_fee:"Bürogebühr",agent_mission_reward:"Missionsbelohnung",agent_mission_time_bonus_reward:"Missionsbonus",planetary_export_tax:"PI-Exportsteuer",planetary_import_tax:"PI-Importsteuer",jump_clone_activation_fee:"Klonsprung",reprocessing_tax:"Wiederaufbereitung",daily_goal_payouts:"Tagesziel",ess_escrow_transfer:"ESS"};
function refTxt(t){return REF[t]||String(t).replace(/_/g," ");}

/* ================= Wallet-Details ================= */
var wd={tab:"journal"};
M.VIEWS.wdet=async function(sec,p){
  var c=charById(p&&p.id);head(sec,c.character_name,"wallet");var info=el("div","card");sec.appendChild(info);
  tabs(sec,[["journal","Journal"],["tx","Transaktionen"],["sum","Übersicht"]],wd.tab,function(t){wd.tab=t;M.show("wdet",p);});
  var out=el("div");sec.appendChild(out);var msg=msgEl(sec);msg.textContent="Lade …";
  try{
    if(!hasScope(c,"esi-wallet.read_character_wallet.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");
    var bal=await esi(c,"/characters/"+c.character_id+"/wallet/");
    info.appendChild(el("div","nm","Kontostand"));var ib=el("div","isk",short(bal)+" ISK");ib.style.textAlign="left";ib.appendChild(el("small","",exact(bal)));info.appendChild(ib);
    var path="/characters/"+c.character_id+"/wallet/";
    if(wd.tab==="journal"||wd.tab==="sum"){
      var j=await allPages(c,path+"journal/",wd.tab==="sum"?5:2);j.sort(function(a,b){return new Date(b.date)-new Date(a.date);});
      if(wd.tab==="journal"){
        j.slice(0,120).forEach(function(e){var card=el("div","card"),r=el("div","row");r.appendChild(el("div","grow nm",refTxt(e.ref_type)));
          var a=el("div","isk",sgn(e.amount)+" ISK");a.style.color=e.amount<0?"var(--bad)":"var(--ok)";a.appendChild(el("small","",when(e.date)));r.appendChild(a);card.appendChild(r);
          if(e.description){var d=el("div","sub",e.description);d.style.cssText="overflow:hidden;text-overflow:ellipsis;white-space:nowrap";card.appendChild(d);}
          if(e.balance!=null)card.appendChild(el("div","sub","Danach: "+exact(e.balance)));out.appendChild(card);});
        msg.textContent=j.length+" Einträge geladen (zeige "+Math.min(120,j.length)+") · Abgerufen "+M.now();
      }else{
        var now=Date.now(),per=[["Letzte 24 Std.",864e5],["Letzte 7 Tage",6048e5]];
        per.forEach(function(pp){var rows=j.filter(function(e){return now-new Date(e.date)<=pp[1];}),inn=0,outg=0,tax=0,fee=0;
          rows.forEach(function(e){if(e.amount>0)inn+=e.amount;else outg+=e.amount;if(e.ref_type==="transaction_tax")tax+=e.amount;if(e.ref_type==="brokers_fee")fee+=e.amount;});
          var card=el("div","card");card.appendChild(el("div","nm",pp[0]));
          [["Einnahmen",inn],["Ausgaben",outg],["Saldo",inn+outg],["davon Verkaufssteuer",tax],["davon Maklergebühren",fee]].forEach(function(x){var r=el("div","row");r.appendChild(el("div","grow sub",x[0]));var v=el("div","isk",sgn(x[1])+" ISK");v.style.color=x[1]<0?"var(--bad)":"var(--ok)";v.appendChild(el("small","",short(x[1])));r.appendChild(v);card.appendChild(r);});
          out.appendChild(card);});
        var tail=el("p","msg","Das ist Cashflow (Geld rein/raus), nicht Gewinn. Gewinn findest du unter Mehr › Gewinne. ESI liefert höchstens 30 Tage.");out.appendChild(tail);
        msg.textContent="Abgerufen "+M.now();
      }
    }else{
      var tx=await esi(c,path+"transactions/");tx.sort(function(a,b){return new Date(b.date)-new Date(a.date);});
      var ids=[];tx.slice(0,120).forEach(function(t){ids.push(t.type_id);if(t.location_id<1e8)ids.push(t.location_id);});await names(ids);
      tx.slice(0,120).forEach(function(t){var card=el("div","card"),r=el("div","row");r.appendChild(el("div","grow nm",nm(t.type_id)));
        var tot=t.unit_price*t.quantity,v=el("div","isk",(t.is_buy?"-":"+")+exact(tot)+" ISK");v.style.color=t.is_buy?"var(--bad)":"var(--ok)";v.appendChild(el("small","",when(t.date)));r.appendChild(v);card.appendChild(r);
        card.appendChild(el("div","sub",(t.is_buy?"Gekauft ":"Verkauft ")+exact(t.quantity)+" × "+exact(t.unit_price)));
        card.appendChild(el("div","sub",t.location_id<1e8?nm(t.location_id):"Struktur"));out.appendChild(card);});
      msg.textContent=tx.length+" Transaktionen (zeige "+Math.min(120,tx.length)+") · Abgerufen "+M.now();
    }
  }catch(e){msg.textContent=e.message;msg.className="msg bad";}
};

/* ================= Skill-Warteschlange ================= */
function boxes(done){var s="";for(var i=1;i<=5;i++)s+=i<=done?"▰":"▱";return s;}
M.VIEWS.sdet=async function(sec,p){
  var c=charById(p&&p.id);head(sec,c.character_name,"skills");chip(sec,c.character_id,function(id){M.show("sdet",{id:id});});
  var top=el("div","card");sec.appendChild(top);var list=el("div");sec.appendChild(list);var msg=msgEl(sec);msg.textContent="Lade …";
  try{
    if(!hasScope(c,"esi-skills.read_skillqueue.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");
    var q=await esi(c,"/characters/"+c.character_id+"/skillqueue/"),sk=null;
    try{sk=await esi(c,"/characters/"+c.character_id+"/skills/");}catch(e){}
    q=q.filter(function(s){return s.finish_date;}).sort(function(a,b){return a.queue_position-b.queue_position;});await names(q.map(function(s){return s.skill_id;}));
    var lv={};if(sk)sk.skills.forEach(function(s){lv[s.skill_id]=s.trained_skill_level;});
    if(sk){top.appendChild(el("div","nm","Skillpunkte: "+exact(sk.total_sp)));if(sk.unallocated_sp)top.appendChild(el("div","sub","Nicht verteilt: "+exact(sk.unallocated_sp)));}
    if(!q.length){top.appendChild(el("div","msg bad","Keine Skills in der Warteschlange!"));msg.textContent="";return;}
    var end=new Date(q[q.length-1].finish_date)-Date.now();var e=el("div","sub","Warteschlange: "+q.length+" Skills · endet "+when(q[q.length-1].finish_date)+" (in "+fmtDur(end)+")");top.appendChild(e);
    if(end<864e5){var w=el("div","msg bad","Bald leer – neue Skills eintragen!");top.appendChild(w);}
    q.forEach(function(s,i){var card=el("div","card"),r=el("div","row");r.appendChild(el("div","grow nm",(i+1)+". "+nm(s.skill_id)));var l=el("div","isk","Stufe "+s.finish_level);l.appendChild(el("small","",boxes(s.finish_level-1)+" → "+boxes(s.finish_level)));r.appendChild(l);card.appendChild(r);
      var st=new Date(s.start_date||s.finish_date).getTime(),fi=new Date(s.finish_date).getTime(),left=fi-Date.now();
      card.appendChild(el("div","sub",(i===0?"läuft · noch "+fmtDur(left):"fertig "+when(s.finish_date)+" · Dauer "+fmtDur(fi-st))));
      if(i===0&&s.start_date){var tot=fi-st,pr=Math.max(0,Math.min(1,1-left/tot)),bar=el("div");bar.style.cssText="height:6px;border-radius:3px;background:var(--ln);margin-top:6px;overflow:hidden";var f=el("div");f.style.cssText="height:100%;background:var(--cy);width:"+Math.round(pr*100)+"%";bar.appendChild(f);card.appendChild(bar);}
      list.appendChild(card);});
    msg.textContent="Abgerufen "+M.now();
  }catch(e){msg.textContent=e.message;msg.className="msg bad";}
};

/* ================= Assets ================= */
var as={cid:null,q:""};
M.VIEWS.assets=async function(sec){
  var c=as.cid?charById(as.cid):M.activeChar();as.cid=c.character_id;head(sec,"Assets","more");chip(sec,c.character_id,function(id){as.cid=id;M.show("assets");});
  var inp=document.createElement("input");inp.type="search";inp.placeholder="Suchen (Name oder Ort)";inp.value=as.q;inp.style.cssText="width:100%;padding:12px;border-radius:10px;border:1px solid var(--ln);background:var(--sf);color:var(--fg);font:inherit;margin:6px 0";sec.appendChild(inp);
  var out=el("div");sec.appendChild(out);var msg=msgEl(sec);msg.textContent="Lade …";
  try{
    if(!hasScope(c,"esi-assets.read_assets.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");
    var items=await allPages(c,"/characters/"+c.character_id+"/assets/",40);
    var top=items.filter(function(i){return i.location_type==="station"||i.location_type==="solar_system"||i.location_id>1e12;});
    var agg={};top.forEach(function(i){var k=i.location_id+":"+i.type_id;if(!agg[k])agg[k]={loc:i.location_id,t:i.type_id,q:0};agg[k].q+=i.quantity||1;});
    var rows=Object.keys(agg).map(function(k){return agg[k];});
    var ids=[];rows.forEach(function(r){ids.push(r.t);if(r.loc<1e8||r.loc<4e7)ids.push(r.loc);});await names(ids);
    var structs=rows.filter(function(r){return r.loc>1e12;}).map(function(r){return r.loc;}).filter(function(v,i,a){return a.indexOf(v)===i;});
    if(hasScope(c,"esi-universe.read_structures.v1"))await Promise.all(structs.slice(0,40).map(async function(id){try{var n=JSON.parse(M.lsGet("eve-omni-m-struct")||"{}");if(!n[id]){var s=await esi(c,"/universe/structures/"+id+"/");n[id]=s.name;M.lsSet("eve-omni-m-struct",JSON.stringify(n));}}catch(e){}}));
    var sn={};try{sn=JSON.parse(M.lsGet("eve-omni-m-struct")||"{}");}catch(e){}
    function locName(id){return id>1e12?(sn[id]||"Struktur "+id):nm(id);}
    var ncont=items.length-top.length;
    function draw(){
      as.q=inp.value.trim().toLowerCase();out.textContent="";var by={};
      rows.forEach(function(r){var n=nm(r.t),l=locName(r.loc);if(as.q&&n.toLowerCase().indexOf(as.q)<0&&l.toLowerCase().indexOf(as.q)<0)return;(by[r.loc]=by[r.loc]||{l:l,r:[]}).r.push({n:n,q:r.q});});
      var locs=Object.keys(by).sort(function(a,b){return by[a].l<by[b].l?-1:1;}),shown=0;
      locs.forEach(function(k){if(shown>400)return;var card=el("div","card"),n=el("div","nm",by[k].l);card.appendChild(n);
        by[k].r.sort(function(a,b){return b.q-a.q;}).forEach(function(r){if(shown++>400)return;var row=el("div","row");row.appendChild(el("div","grow",r.n));row.appendChild(el("div","isk",exact(r.q)));card.appendChild(row);});out.appendChild(card);});
      msg.textContent=locs.length+" Orte · "+exact(rows.length)+" Posten"+(ncont?" · "+exact(ncont)+" Gegenstände in Containern/Schiffen nicht aufgelistet":"")+" · Abgerufen "+M.now();
    }
    inp.oninput=draw;draw();
  }catch(e){msg.textContent=e.message;msg.className="msg bad";}
};

/* ================= Skill-Werte für Steuer/Broker ================= */
async function fees(c){
  var acc=0,br=0;try{var s=await esi(c,"/characters/"+c.character_id+"/skills/");s.skills.forEach(function(x){if(x.skill_id===16622)acc=x.trained_skill_level;if(x.skill_id===3446)br=x.trained_skill_level;});}catch(e){}
  return {tax:0.075*(1-0.11*acc),broker:Math.max(0.01,0.03-0.003*br),acc:acc,br:br};
}
/* ================= Gewinne (FIFO, geschätzt) ================= */
M.VIEWS.pnl=async function(sec){
  var c=as.pcid?charById(as.pcid):M.activeChar();head(sec,"Gewinne","more");chip(sec,c.character_id,function(id){as.pcid=id;M.show("pnl");});
  var top=el("div","card");sec.appendChild(top);var out=el("div");sec.appendChild(out);var msg=msgEl(sec);msg.textContent="Lade …";
  try{
    if(!hasScope(c,"esi-wallet.read_character_wallet.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");
    var tx=await esi(c,"/characters/"+c.character_id+"/wallet/transactions/"),f=await fees(c),jr=[];
    try{jr=await allPages(c,"/characters/"+c.character_id+"/wallet/journal/",5);}catch(e){}
    tx.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    var q={},res={};
    tx.forEach(function(t){
      if(t.is_buy){(q[t.type_id]=q[t.type_id]||[]).push({q:t.quantity,p:t.unit_price});return;}
      var need=t.quantity,rev=0,cost=0,got=0,lots=q[t.type_id]||[];
      while(need>0&&lots.length){var l=lots[0],u=Math.min(l.q,need);cost+=u*l.p;rev+=u*t.unit_price;got+=u;need-=u;l.q-=u;if(l.q<=0)lots.shift();}
      if(got){var r=res[t.type_id]=res[t.type_id]||{q:0,rev:0,cost:0};r.q+=got;r.rev+=rev;r.cost+=cost;}
    });
    var ids=Object.keys(res).map(Number);await names(ids);
    var brok=0;jr.forEach(function(e){if(e.ref_type==="brokers_fee")brok+=e.amount;});
    var list=ids.map(function(id){var r=res[id],tax=r.rev*f.tax,net=r.rev-r.cost-tax;return {id:id,q:r.q,net:net,per:net/r.q,rev:r.rev,cost:r.cost,tax:tax};}).sort(function(a,b){return b.net-a.net;});
    var sum=list.reduce(function(a,x){return a+x.net;},0),totNet=sum+brok;
    var h=el("div","row");h.appendChild(el("div","grow nm","Gewinn netto (geschätzt)"));var v=el("div","isk",sgn(totNet)+" ISK");v.style.color=totNet<0?"var(--bad)":"var(--ok)";v.appendChild(el("small","",short(totNet)));h.appendChild(v);top.appendChild(h);
    top.appendChild(el("div","sub","Verkäufe mit zugeordnetem Einkauf (FIFO) minus Verkaufssteuer "+pct(f.tax)+" (Accounting "+f.acc+") minus Maklergebühren aus dem Journal ("+exact(brok)+" ISK, enthält auch Preisänderungen). Nur die letzten 30 Tage."));
    list.forEach(function(x){var card=el("div","card"),r=el("div","row");r.appendChild(el("div","grow nm",nm(x.id)));var a=el("div","isk",sgn(x.net)+" ISK");a.style.color=x.net<0?"var(--bad)":"var(--ok)";a.appendChild(el("small","",short(x.net)));r.appendChild(a);card.appendChild(r);
      card.appendChild(el("div","sub","Netto pro Stück: "+sgn2(x.per)+" ISK · "+exact(x.q)+" Stück verkauft"));card.appendChild(el("div","sub","Umsatz "+short(x.rev)+" · Einkauf "+short(x.cost)+" · Steuer "+short(x.tax)));out.appendChild(card);});
    msg.textContent=(list.length?"":"Keine Verkäufe mit Einkauf im Zeitraum. ")+"Abgerufen "+M.now();
  }catch(e){msg.textContent=e.message;msg.className="msg bad";}
};

/* ================= Route ================= */
var SEC={};try{SEC=JSON.parse(M.lsGet("eve-omni-m-sec")||"{}");}catch(e){}
function secColor(s){var r=Math.round(s*10)/10;return r>=0.5?"var(--ok)":r>0?"var(--gd)":"var(--bad)";}
var rt={from:"",to:"",flag:"secure"};
M.VIEWS.route=async function(sec){
  head(sec,"Route","more");var card=el("div","card");sec.appendChild(card);
  function field(lbl,val){var l=el("div","sub",lbl),i=document.createElement("input");i.value=val;i.style.cssText="width:100%;padding:12px;border-radius:10px;border:1px solid var(--ln);background:var(--sf2);color:var(--fg);font:inherit;margin:2px 0 8px";i.setAttribute("autocapitalize","off");card.appendChild(l);card.appendChild(i);return i;}
  var f1=field("Von (Systemname)",rt.from),f2=field("Nach (Systemname)",rt.to);
  var loc=el("button","ghost","Mein Standort als Start");loc.style.marginRight="8px";card.appendChild(loc);
  var sel=document.createElement("select");sel.style.cssText="padding:12px;border-radius:10px;border:1px solid var(--ln);background:var(--sf2);color:var(--fg);font:inherit";[["secure","Sicherste"],["shortest","Kürzeste"],["insecure","Unsicherste"]].forEach(function(o){var op=document.createElement("option");op.value=o[0];op.textContent=o[1];if(o[0]===rt.flag)op.selected=true;sel.appendChild(op);});card.appendChild(sel);
  var go=el("button","","Route berechnen");go.style.cssText="width:100%;margin-top:10px";card.appendChild(go);
  var out=el("div");sec.appendChild(out);var msg=msgEl(sec);
  loc.onclick=async function(){var c=M.activeChar();try{if(!hasScope(c,"esi-location.read_location.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");var l=await esi(c,"/characters/"+c.character_id+"/location/");await names([l.solar_system_id]);f1.value=nm(l.solar_system_id);}catch(e){msg.textContent=e.message;msg.className="msg bad";}};
  go.onclick=async function(){
    rt.from=f1.value.trim();rt.to=f2.value.trim();rt.flag=sel.value;out.textContent="";msg.className="msg";msg.textContent="Berechne …";
    try{
      var r=await esiRaw(null,"/universe/ids/",false,{names:[rt.from,rt.to]}),ids=await r.json(),s=ids.systems||[];
      var a=s.filter(function(x){return x.name.toLowerCase()===rt.from.toLowerCase();})[0],b=s.filter(function(x){return x.name.toLowerCase()===rt.to.toLowerCase();})[0];
      if(!a||!b)throw new Error("Systemname nicht gefunden"+(!a?": "+rt.from:"")+(!b?": "+rt.to:"")+" (englische Namen).");
      var route=await pub("/route/"+a.id+"/"+b.id+"/?flag="+rt.flag);await names(route);
      var need=route.filter(function(i){return SEC[i]==null;});
      await Promise.all(need.map(async function(i){try{SEC[i]=(await pub("/universe/systems/"+i+"/")).security_status;}catch(e){}}));
      M.lsSet("eve-omni-m-sec",JSON.stringify(SEC));
      var kills={};try{(await pub("/universe/system_kills/")).forEach(function(k){kills[k.system_id]=k.ship_kills+k.pod_kills;});}catch(e){}
      var low=route.filter(function(i){return SEC[i]!=null&&SEC[i]<0.5;}).length;
      var head2=el("div","card");head2.appendChild(el("div","nm",(route.length-1)+" Sprünge"));head2.appendChild(el("div","sub",low?low+(low===1?" System":" Systeme")+" unter 0,5 (Lowsec/Nullsec)":"nur Highsec"));
      var cp=el("button","ghost","Route kopieren");cp.style.marginTop="8px";cp.onclick=function(){M.copy(route.map(nm).join("\n"),cp);};head2.appendChild(cp);
      var ap=el("button","ghost","Ziel im Spiel setzen");ap.style.cssText="margin:8px 0 0 8px";ap.onclick=async function(){var c=M.activeChar();try{if(!hasScope(c,"esi-ui.write_waypoint.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");await esiRaw(c,"/ui/autopilot/waypoint/?add_to_beginning=false&clear_other_waypoints=true&destination_id="+b.id,false,null);ap.textContent="Ziel gesetzt ✓";}catch(e){ap.textContent=e.message;}};head2.appendChild(ap);
      out.appendChild(head2);
      route.forEach(function(id,i){var row=el("div","card row");row.style.padding="8px 14px";row.appendChild(el("div","sub",String(i)));var n=el("div","grow nm",nm(id));row.appendChild(n);
        var s2=el("div","isk",SEC[id]!=null?(Math.round(SEC[id]*10)/10).toFixed(1).replace(".",","):"?");s2.style.color=SEC[id]!=null?secColor(SEC[id]):"var(--mu)";if(kills[id])s2.appendChild(el("small","",kills[id]+" Kills/Std"));row.appendChild(s2);out.appendChild(row);});
      msg.textContent="Kills der letzten Stunde laut ESI · Abgerufen "+M.now();
    }catch(e){msg.textContent=e.message;msg.className="msg bad";}
  };
};

/* ================= Wertschätzer ================= */
var ap={text:""};
function parseList(t){
  var out=[];t.split(/\r?\n/).forEach(function(line){line=line.trim();if(!line)return;var n,q=1,m;
    if((m=line.match(/^(.*?)[\t ]+[x×]?\s*([\d.,]+)$/))&&!/^[\d.,]+$/.test(m[1])){n=m[1].trim();q=m[2];}
    else if((m=line.match(/^([\d.,]+)\s*[x×]?\s+(.+)$/))){q=m[1];n=m[2].trim();}
    else n=line;
    n=n.replace(/\s+[x×]\s*$/,"");q=parseInt(String(q).replace(/[.,]/g,""),10)||1;out.push({n:n,q:q});});
  var by={};out.forEach(function(o){var k=o.n.toLowerCase();if(by[k])by[k].q+=o.q;else by[k]=o;});return Object.keys(by).map(function(k){return by[k];});
}
async function jitaBest(tid){
  var sell=null,buy=null;
  async function side(s){var best=null,r=await esiRaw(null,"/markets/10000002/orders/?order_type="+s+"&type_id="+tid+"&page=1"),pages=Math.min(r.pages,4),p=1,all=await r.json();
    for(p=2;p<=pages;p++)all=all.concat(await (await esiRaw(null,"/markets/10000002/orders/?order_type="+s+"&type_id="+tid+"&page="+p)).json());
    all.forEach(function(o){if(o.location_id!==60003760)return;if(best===null||(s==="sell"?o.price<best:o.price>best))best=o.price;});return best;}
  var r=await Promise.all([side("sell"),side("buy")]);return {sell:r[0],buy:r[1]};
}
M.VIEWS.appr=async function(sec){
  head(sec,"Wertschätzer","more");var ta=document.createElement("textarea");ta.rows=7;ta.placeholder="Liste aus dem Spiel einfügen (Inventar, Multibuy, Fitting …). Englische Namen.";ta.value=ap.text;
  ta.style.cssText="width:100%;padding:12px;border-radius:10px;border:1px solid var(--ln);background:var(--sf);color:var(--fg);font:inherit;margin:6px 0";sec.appendChild(ta);
  var go=el("button","","Bewerten (Jita 4-4)");go.style.width="100%";sec.appendChild(go);var out=el("div");sec.appendChild(out);var msg=msgEl(sec);
  go.onclick=async function(){
    ap.text=ta.value;out.textContent="";msg.className="msg";var items=parseList(ta.value).slice(0,60);if(!items.length){msg.textContent="Nichts erkannt.";return;}msg.textContent="Suche Namen …";
    try{
      var r=await esiRaw(null,"/universe/ids/",false,{names:items.map(function(i){return i.n;})}),ids=await r.json(),ty={};(ids.inventory_types||[]).forEach(function(t){ty[t.name.toLowerCase()]=t.id;});
      var rows=items.map(function(i){return {n:i.n,q:i.q,id:ty[i.n.toLowerCase()]};}),ok=rows.filter(function(r){return r.id;});
      var f=await fees(M.activeChar()),pr={},i=0;msg.textContent="Lade Preise (0/"+ok.length+") …";
      async function worker(){while(i<ok.length){var r=ok[i++];try{pr[r.id]=await jitaBest(r.id);}catch(e){pr[r.id]={};}msg.textContent="Lade Preise ("+Math.min(i,ok.length)+"/"+ok.length+") …";}}
      await Promise.all([worker(),worker(),worker(),worker()]);
      var sumS=0,sumB=0,miss=[];
      rows.forEach(function(r){var card=el("div","card row"),p=r.id?pr[r.id]||{}:{};var g=el("div","grow");g.appendChild(el("div","nm",r.n));
        if(!r.id){g.appendChild(el("div","msg bad","Name nicht erkannt"));miss.push(r.n);}else if(p.sell==null&&p.buy==null){g.appendChild(el("div","msg bad","Kein Preis in Jita 4-4"));}
        else g.appendChild(el("div","sub",exact(r.q)+" × "+exact(p.sell!=null?p.sell:p.buy)+" ISK"));card.appendChild(g);
        var v=(p.sell!=null?p.sell:p.buy||0)*r.q;if(p.sell!=null)sumS+=p.sell*r.q;else if(p.buy!=null)sumS+=p.buy*r.q;if(p.buy!=null)sumB+=p.buy*r.q;
        card.appendChild(el("div","isk",short(v)));out.appendChild(card);});
      var net=sumS*(1-f.tax-f.broker),t=el("div","card");
      [["Verkaufsorder (bestes Angebot, brutto)",sumS],["abzüglich Steuer "+pct(f.tax)+" und Broker "+pct(f.broker)+": netto",net],["Sofortverkauf an Kauforders",sumB]].forEach(function(x){var r=el("div","row");r.appendChild(el("div","grow sub",x[0]));var v=el("div","isk",short(x[1])+" ISK");v.appendChild(el("small","",exact(x[1])));r.appendChild(v);t.appendChild(r);});
      out.insertBefore(t,out.firstChild);msg.textContent=ok.length+" Waren"+(miss.length?" · nicht erkannt: "+miss.length:"")+(items.length>=60?" · nur die ersten 60":"")+" · Abgerufen "+M.now();
    }catch(e){msg.textContent=e.message;msg.className="msg bad";}
  };
};

/* ================= Planeten (PI) ================= */
M.VIEWS.pi=async function(sec){
  head(sec,"Planeten (PI)","more");var out=el("div");sec.appendChild(out);var msg=msgEl(sec);msg.textContent="Lade …";var chars=M.loadChars(),n=0;
  await Promise.all(chars.map(async function(c){
    try{
      if(!hasScope(c,"esi-planets.manage_planets.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");
      var pl=await esi(c,"/characters/"+c.character_id+"/planets/"),det=await Promise.all(pl.map(async function(p){try{return {p:p,d:await esi(c,"/characters/"+c.character_id+"/planets/"+p.planet_id+"/")};}catch(e){return {p:p};}}));
      await names(pl.map(function(p){return p.solar_system_id;}));
      var pn={};await Promise.all(pl.map(async function(p){try{pn[p.planet_id]=(await pub("/universe/planets/"+p.planet_id+"/")).name;}catch(e){}}));
      var card=el("div","card");card.appendChild(el("div","nm",c.character_name));if(!pl.length)card.appendChild(el("div","sub","Keine Planeten."));
      det.forEach(function(x){n++;var ex=((x.d&&x.d.pins)||[]).filter(function(pin){return pin.extractor_details;}),exp=ex.map(function(pin){return new Date(pin.expiry_time).getTime();}).filter(Boolean).sort(function(a,b){return a-b;})[0];
        var row=el("div","row");row.style.marginTop="8px";var g=el("div","grow");g.appendChild(el("div","nm",pn[x.p.planet_id]||("Planet "+x.p.planet_id)));g.appendChild(el("div","sub",x.p.planet_type+" · "+nm(x.p.solar_system_id)+" · "+ex.length+" Extraktoren"));row.appendChild(g);
        var st=el("div","isk",exp==null?"–":exp<Date.now()?"abgelaufen":"noch "+fmtDur(exp-Date.now()));st.style.color=exp!=null&&exp-Date.now()<288e5?"var(--bad)":"var(--ok)";row.appendChild(st);card.appendChild(row);});
      out.appendChild(card);
    }catch(e){var cd=el("div","card");cd.appendChild(el("div","nm",c.character_name));cd.appendChild(el("div","msg bad",e.message));out.appendChild(cd);}
  }));
  msg.textContent=n+" Planeten · rot = Extraktor endet in unter 8 Std. · Abgerufen "+M.now();
};

/* ================= Industrie, Verträge, Mining ================= */
var ACT={1:"Herstellung",3:"Zeiteffizienz",4:"Materialeffizienz",5:"Kopieren",8:"Invention",9:"Reaktion"};
M.VIEWS.ind=async function(sec){
  head(sec,"Industrie & Verträge","more");var out=el("div");sec.appendChild(out);var msg=msgEl(sec);msg.textContent="Lade …";var chars=M.loadChars(),errs=[];
  var jobs=[],cons=[],mine=[];
  await Promise.all(chars.map(async function(c){
    var id=c.character_id;
    async function tr(scope,fn){if(!hasScope(c,scope)){errs.push(c.character_name+": "+scope.split(".")[1]+" fehlt");return;}try{await fn();}catch(e){errs.push(c.character_name+": "+e.message);}}
    await Promise.all([
      tr("esi-industry.read_character_jobs.v1",async function(){(await esi(c,"/characters/"+id+"/industry/jobs/")).forEach(function(j){j._c=c.character_name;jobs.push(j);});}),
      tr("esi-contracts.read_character_contracts.v1",async function(){(await esi(c,"/characters/"+id+"/contracts/")).forEach(function(k){if(k.status==="outstanding"||k.status==="in_progress"){k._c=c.character_name;cons.push(k);}});}),
      tr("esi-industry.read_character_mining.v1",async function(){(await esi(c,"/characters/"+id+"/mining/")).forEach(function(m){m._c=c.character_name;mine.push(m);});})]);
  }));
  await names(jobs.map(function(j){return j.product_type_id||j.blueprint_type_id;}).concat(mine.map(function(m){return m.type_id;})));
  function card(title){var c=el("div","card");c.appendChild(el("div","nm",title));out.appendChild(c);return c;}
  var cj=card("Industrie-Jobs ("+jobs.filter(function(j){return j.status==="active";}).length+" aktiv)");
  jobs.filter(function(j){return j.status==="active"||j.status==="paused";}).sort(function(a,b){return new Date(a.end_date)-new Date(b.end_date);}).forEach(function(j){var r=el("div","row");r.style.marginTop="6px";var g=el("div","grow");g.appendChild(el("div","",(ACT[j.activity_id]||"Job")+": "+nm(j.product_type_id||j.blueprint_type_id)+" ×"+j.runs));g.appendChild(el("div","sub",j._c));r.appendChild(g);var e=new Date(j.end_date)-Date.now();r.appendChild(el("div","isk",e<=0?"fertig":"noch "+fmtDur(e)));cj.appendChild(r);});
  if(!jobs.some(function(j){return j.status==="active";}))cj.appendChild(el("div","sub","Keine laufenden Jobs."));
  var cc=card("Verträge ("+cons.length+" offen)");
  cons.sort(function(a,b){return new Date(a.date_expired)-new Date(b.date_expired);}).slice(0,30).forEach(function(k){var r=el("div","row");r.style.marginTop="6px";var g=el("div","grow");g.appendChild(el("div","",({item_exchange:"Tausch",courier:"Kurier",auction:"Auktion"})[k.type]||k.type));g.appendChild(el("div","sub",k._c+(k.title?" · "+k.title:"")));r.appendChild(g);var v=el("div","isk",k.type==="courier"?short(k.reward)+" ISK":short(k.price||0)+" ISK");v.appendChild(el("small","","läuft ab in "+fmtDur(new Date(k.date_expired)-Date.now())));r.appendChild(v);cc.appendChild(r);});
  if(!cons.length)cc.appendChild(el("div","sub","Keine offenen Verträge."));
  var cm=card("Mining (letzte Einträge)"),byd={};mine.forEach(function(m){var k=m.date+"|"+m.type_id;byd[k]=(byd[k]||0)+m.quantity;});
  Object.keys(byd).sort().reverse().slice(0,12).forEach(function(k){var p=k.split("|"),r=el("div","row");r.appendChild(el("div","grow sub",p[0]+" · "+nm(+p[1])));r.appendChild(el("div","isk",exact(byd[k])));cm.appendChild(r);});
  if(!mine.length)cm.appendChild(el("div","sub","Keine Mining-Einträge."));
  msg.textContent=(errs.length?errs.join(" · ")+" · ":"")+"Abgerufen "+M.now();if(errs.length)msg.className="msg bad";
};
})();

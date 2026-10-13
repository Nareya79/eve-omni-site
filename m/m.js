/* EVEOmni Mobile 0.1.0 – Stufe M1+M2: Login (EVE SSO, PKCE, ohne Secret), mehrere Charaktere, Token-Erneuerung, Wallet.
   Nur lesen. Eigener Speicher (Praefix eve-omni-m-), getrennt vom Desktop. */
(function(){
"use strict";
var VERSION="1.0.0";
var I18=window.OmniI18n||{en:false,th:".",dec:",",loc:"de-DE",units:["Tsd.","Mio.","Mrd."],int:function(n){return String(Math.round(n));},fix:function(n,d){return n.toFixed(d);}};
var CLIENT_ID="26b3d504aaa6443daed268d2cea52bc7", OLD_ID="aa3a93ff84e84013967e34b5e35b5267";
var REDIRECT="https://omni.nareya79.com/callback.html";
var AUTH="https://login.eveonline.com/v2/oauth/authorize", TOKEN="https://login.eveonline.com/v2/oauth/token";
var ESI="https://esi.evetech.net", COMPAT="2026-08-18";
/* gleiche Liste wie im Desktop-Login, ohne Mail */
var SCOPES=["esi-skills.read_skills.v1","esi-wallet.read_character_wallet.v1","esi-assets.read_assets.v1","esi-universe.read_structures.v1","esi-markets.read_character_orders.v1","esi-contracts.read_character_contracts.v1","esi-contracts.read_corporation_contracts.v1","esi-industry.read_character_jobs.v1","esi-industry.read_character_mining.v1","esi-clones.read_implants.v1","esi-skills.read_skillqueue.v1","esi-location.read_location.v1","esi-location.read_online.v1","esi-location.read_ship_type.v1","esi-planets.manage_planets.v1","esi-clones.read_clones.v1","esi-characters.read_standings.v1","esi-characters.read_contacts.v1","esi-ui.write_waypoint.v1","esi-ui.open_window.v1","esi-characters.read_blueprints.v1","esi-wallet.read_corporation_wallets.v1","esi-corporations.read_divisions.v1","esi-industry.read_corporation_mining.v1"].join(" ");
var K_CH="eve-omni-m-characters", K_LOGIN="eve-omni-m-login", K_V="eve-omni-m-verifier", K_S="eve-omni-m-state";
var $=function(id){return document.getElementById(id);};

/* ---------- Speicher (immer mit try/catch) ---------- */
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function lsDel(k){try{localStorage.removeItem(k);}catch(e){}}
function loadChars(){try{return JSON.parse(lsGet(K_CH)||"[]")||[];}catch(e){return [];}}
function saveChars(a){lsSet(K_CH,JSON.stringify(a));}

/* ---------- PKCE / JWT ---------- */
function b64url(bytes){var s="";for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");}
function rnd(n){var a=new Uint8Array(n);crypto.getRandomValues(a);return b64url(a);}
async function challenge(v){var d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return b64url(new Uint8Array(d));}
function jwt(t){var p=t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");while(p.length%4)p+="=";var bin=atob(p),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return JSON.parse(new TextDecoder().decode(u));}
function tokFromData(d){var p=jwt(d.access_token);return {character_id:String(p.sub.split(":")[2]),character_name:p.name,access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Date.now()+d.expires_in*1000-30000,scp:[].concat(p.scp||[])};}

/* ---------- Zahlen: Tsd./Mio./Mrd. + exakt mit Punkten ---------- */
function exact(n){return I18.int(n);}
function short(n){var a=Math.abs(n),s=n<0?"-":"",u=I18.units;
  function f(v,x){return s+(Math.round(v*100)/100).toString().replace(".",I18.dec)+" "+x;}
  if(a>=1e9)return f(a/1e9,u[2]);if(a>=1e6)return f(a/1e6,u[1]);if(a>=1e3)return f(a/1e3,u[0]);return s+(Math.round(a*100)/100).toString().replace(".",I18.dec);}

/* ---------- Login ---------- */
async function loginStart(){
  try{
    if(!window.crypto||!crypto.subtle)throw new Error("Dieser Browser kann den sicheren Login nicht (crypto fehlt).");
    var v=rnd(32),st=rnd(16),ch=await challenge(v);
    lsSet(K_V,v);lsSet(K_S,st);lsSet(K_LOGIN,String(Date.now()));   /* Merker: callback.html leitet dann nach /m/ zurueck */
    location.href=AUTH+"?response_type=code&client_id="+encodeURIComponent(CLIENT_ID)+"&redirect_uri="+encodeURIComponent(REDIRECT)+"&scope="+encodeURIComponent(SCOPES)+"&state="+encodeURIComponent(st)+"&code_challenge="+encodeURIComponent(ch)+"&code_challenge_method=S256";
  }catch(e){$("login-msg").textContent="Login konnte nicht gestartet werden: "+e.message;$("login-msg").className="msg bad";}
}
function errText(err){
  if(err==="invalid_scope")return "Login abgelehnt: EVE kennt eine der angefragten Berechtigungen nicht. Bitte melde das (GitHub/Discord).";
  if(err==="access_denied")return "Login abgebrochen: Die Anmeldung wurde bei EVE nicht bestätigt.";
  if(err==="invalid_request")return "Login abgelehnt: ungültige Anfrage (Client). Bitte die App neu laden.";
  return "Login fehlgeschlagen ("+err+").";
}
async function loginFinish(q){
  var msg=$("login-msg");
  try{
    if(q.get("error"))throw new Error(errText(q.get("error")));
    var st=lsGet(K_S),v=lsGet(K_V);
    if(!st||q.get("state")!==st)throw new Error("Sicherheitscheck fehlgeschlagen (state) – bitte Login erneut starten.");
    if(!v)throw new Error("Kein Code-Verifier – bitte Login erneut starten.");
    var r=await fetch(TOKEN,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=authorization_code&code="+encodeURIComponent(q.get("code"))+"&code_verifier="+encodeURIComponent(v)+"&client_id="+encodeURIComponent(CLIENT_ID)});
    if(!r.ok)throw new Error("Token-Austausch fehlgeschlagen ("+r.status+")");
    var t=tokFromData(await r.json());t.client_id=CLIENT_ID;
    var all=loadChars().filter(function(c){return c.character_id!==t.character_id;});all.push(t);saveChars(all);
    lsSet("eve-omni-m-active",t.character_id);
    return true;
  }catch(e){if(msg){msg.textContent=e.message;msg.className="msg bad";}return false;}
  finally{lsDel(K_V);lsDel(K_S);lsDel(K_LOGIN);}
}
async function accessToken(c){
  if(Date.now()<c.expires_at)return c.access_token;
  var r=await fetch(TOKEN,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=refresh_token&refresh_token="+encodeURIComponent(c.refresh_token)+"&client_id="+encodeURIComponent(c.client_id||OLD_ID)});
  if(!r.ok){var e=new Error("Sitzung von "+c.character_name+" abgelaufen – bitte neu einloggen.");e.expired=true;throw e;}
  var n=tokFromData(await r.json()),all=loadChars();
  for(var i=0;i<all.length;i++)if(all[i].character_id===c.character_id){all[i].access_token=n.access_token;all[i].refresh_token=n.refresh_token||all[i].refresh_token;all[i].expires_at=n.expires_at;c=all[i];}
  saveChars(all);return c.access_token;
}
/* ---------- ESI ---------- */
async function esiRaw(c,path,retry,body){
  var h={"X-Compatibility-Date":COMPAT};if(c)h.Authorization="Bearer "+await accessToken(c);
  var o={headers:h};if(body===null)o.method="POST";else if(body){o.method="POST";h["Content-Type"]="application/json";o.body=JSON.stringify(body);}
  var r=await fetch(ESI+path,o);
  if(r.status===429&&!retry){var w=Math.min(30,parseInt(r.headers.get("Retry-After")||"5",10)||5);await new Promise(function(x){setTimeout(x,w*1000);});return esiRaw(c,path,true,body);}
  if(!r.ok){var e=new Error("ESI "+r.status);e.status=r.status;throw e;}
  r.pages=parseInt(r.headers.get("X-Pages")||"1",10)||1;
  return r;
}
async function esi(c,path){return (await esiRaw(c,path)).json();}
async function pub(path){return (await esiRaw(null,path)).json();}
function hasScope(c,s){return !c.scp||!c.scp.length||c.scp.indexOf(s)>=0;}

/* ---------- Namen (Waren, Systeme, Stationen) ---------- */
var NM={};try{NM=JSON.parse(lsGet("eve-omni-m-names")||"{}")||{};}catch(e){}
async function names(ids){
  var need=[],seen={};ids.forEach(function(i){if(i&&!NM[i]&&!seen[i]){seen[i]=1;need.push(i);}});
  for(var k=0;k<need.length;k+=500){
    try{var r=await esiRaw(null,"/universe/names/",false,need.slice(k,k+500));(await r.json()).forEach(function(x){NM[x.id]=x.name;});}catch(e){}
  }
  if(need.length){var keys=Object.keys(NM);if(keys.length>3000)keys.slice(0,keys.length-3000).forEach(function(x){delete NM[x];});lsSet("eve-omni-m-names",JSON.stringify(NM));}
}
function nm(id){return NM[id]||("#"+id);}
/* ---------- Preise (4 gueltige Stellen, wie im Spiel) ---------- */
function tick(p){return Math.max(0.01,Math.pow(10,Math.floor(Math.log10(p))-3));}
function snap(p){var t=tick(p);return Math.round(Math.round(p/t)*t*100)/100;}
function priceTxt(p){return (Math.round(p*100)/100).toFixed(2);}   /* zum Kopieren/Tippen: Punkt als Komma-Trenner, keine Tausenderpunkte */
function newPrice(buy,best){return snap(buy?best+tick(best):best-tick(best));}
function fmtDur(ms){if(ms<=0)return "abgelaufen";var m=Math.floor(ms/60000),d=Math.floor(m/1440),h=Math.floor(m%1440/60);m=m%60;return d?d+" Tg. "+h+" Std.":h?h+" Std. "+m+" Min.":m+" Min.";}
async function copy(txt,btn){try{await navigator.clipboard.writeText(txt);}catch(e){var t=document.createElement("textarea");t.value=txt;document.body.appendChild(t);t.select();try{document.execCommand("copy");}catch(x){}t.remove();}
  if(btn){var o=btn.textContent;btn.textContent="Kopiert ✓";setTimeout(function(){btn.textContent=o;},1200);}}
function now(){var t=new Date();return ("0"+t.getHours()).slice(-2)+":"+("0"+t.getMinutes()).slice(-2);}

/* ---------- Darstellung (Mehr › Darstellung): Design, Akzentfarbe, Größe, Layout ---------- */
var SIZES=[[0.9,"Klein"],[1,"Normal"],[1.12,"Groß"],[1.25,"Sehr groß"]];
/* Farbschemata wie in der Desktop-App + Automatisch (folgt dem Handy) und Schwarz (OLED); Farbtupfer = Hintergrund, Akzent */
var THEMES=[["auto","Automatisch",["#0b1118","#eef3f7"]],["photon","Photon · Türkis",["#121c26","#86d1eb"]],["caldari","Caldari · Stahlblau",["#0b1018","#6f9df2"]],["amarr","Amarr · Gold",["#12100c","#d8aa4c"]],
  ["minmatar","Minmatar · Rost",["#130f0e","#de6b3f"]],["gallente","Gallente · Grün",["#0b1210","#3fc49c"]],["black","Schwarz",["#000000","#86d1eb"]],["light","Hell · Tag",["#ffffff","#0b7ea3"]]];
function look(){var o={};try{o=JSON.parse(lsGet("eve-omni-m-look"))||{};}catch(e){}if(o.theme==="dark")o.theme="photon";
  return {theme:THEMES.some(function(t){return t[0]===o.theme;})?o.theme:"auto",size:SIZES.some(function(z){return z[0]===o.size;})?o.size:1,dense:!!o.dense};}
function lookApply(){var l=look(),r=document.documentElement;
  if(l.theme==="auto"||l.theme==="photon")r.removeAttribute("data-theme");else r.setAttribute("data-theme",l.theme);
  if(l.theme==="photon")r.setAttribute("data-theme","photon");   /* Photon = Standard-Dunkel, aber nie hell */
  r.style.setProperty("--zoom",String(l.size));r.classList.toggle("dense",l.dense);
  var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(r).getPropertyValue("--bg").trim()||"#0d141c";}
function lookSet(k,v){var l=look();l[k]=v;lsSet("eve-omni-m-look",JSON.stringify(l));lookApply();}
lookApply();if(window.matchMedia)matchMedia("(prefers-color-scheme: light)").addEventListener("change",lookApply);
function lookCard(){
  var c=el("div","card");c.id="look-opt";c.appendChild(el("div","nm","Darstellung"));var l=look();
  c.appendChild(el("div","sub","Farbschema")).style.marginTop="10px";var sr=el("div","look-row");
  THEMES.forEach(function(t){var b=el("button","look-sch"+(t[0]===l.theme?"":" ghost")),i=el("i");t[2].forEach(function(col){var d=el("b");d.style.background=col;i.appendChild(d);});
    b.appendChild(i);b.appendChild(el("span","",t[1]));b.setAttribute("data-look","theme:"+t[0]);b.onclick=function(){lookSet("theme",t[0]);show("settings");};sr.appendChild(b);});c.appendChild(sr);
  function row(label,items,cur,key){c.appendChild(el("div","sub",label)).style.marginTop="10px";var r=el("div","look-row");
    items.forEach(function(it){var b=el("button",it[0]===cur?"":"ghost",it[1]);b.setAttribute("data-look",key+":"+it[0]);b.onclick=function(){lookSet(key,it[0]);show("settings");};r.appendChild(b);});c.appendChild(r);}
  row("Größe",SIZES,l.size,"size");
  row("Layout",[[false,"Normal"],[true,"Kompakt"]],l.dense,"dense");
  return c;
}

/* ---------- Oberflaeche ---------- */
var view="wallet";
var VIEWS={},LEAVE={},TABOF={wdet:"wallet",sdet:"skills"},param=null;
var CORE=["login","wallet","orders","skills","chars","more"];
/* Navigationsleiste: frei waehlbar (bis zu 4 + "Mehr") */
var NAVCAT={wallet:["◈","Wallet"],orders:["⇄","Orders"],skills:["✦","Skills"],chars:["☺","Chars"],sync:["★","Watchlist"],assets:["▤","Assets"],pnl:["Σ","Gewinne"],pi:["◍","PI"],ind:["⚙","Industrie"],game:["▶","Spiel"]};
var NAVDEF=["wallet","orders","skills","chars"];
function navList(){var a=null;try{a=JSON.parse(lsGet("eve-omni-m-nav"));}catch(e){}
if(!Array.isArray(a))return NAVDEF.slice();return a.filter(function(k,i){return NAVCAT[k]&&a.indexOf(k)===i;}).slice(0,4);}
function renderNav(){var n=$("nav");n.textContent="";
navList().concat(["more"]).forEach(function(k){var b=document.createElement("button");b.setAttribute("data-v",k);var s=document.createElement("span");s.textContent=k==="more"?"☰":NAVCAT[k][0];b.appendChild(s);b.appendChild(document.createTextNode(k==="more"?"Mehr":NAVCAT[k][1]));b.onclick=function(){show(k);};n.appendChild(b);});
var cur=document.querySelector("main > section:not([hidden])");if(cur)markNav();}
function markNav(){var tab=TABOF[view]||view,l=navList();if(l.indexOf(tab)<0)tab="more";
document.querySelectorAll("nav button").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-v")===tab);});}
function show(v,p){
  var chars=loadChars();
  if(LEAVE[view])LEAVE[view]();
  document.querySelectorAll("main > section").forEach(function(s){s.hidden=true;});
  $("nav").hidden=!chars.length;$("b-refresh").hidden=!chars.length;
  if(!chars.length){$("v-login").hidden=false;return;}
  if(v){view=v;param=p||null;}
  try{sessionStorage.setItem("eve-omni-m-view",JSON.stringify([view,param]));}catch(e){}   /* Neuladen (nach unten wischen) bleibt auf dieser Seite */
  var sec=$("v-"+view);if(!sec){sec=document.createElement("section");sec.id="v-"+view;document.querySelector("main").appendChild(sec);}
  sec.hidden=false;window.scrollTo(0,0);$("b-refresh").hidden=view==="game";
  markNav();
  var core={wallet:renderWallet,orders:renderOrders,skills:renderSkills,chars:renderChars,more:renderMore}[view];
  if(core)core();else if(VIEWS[view]){sec.textContent="";VIEWS[view](sec,param);}
}
function activeChar(){var all=loadChars(),id=lsGet("eve-omni-m-active");for(var i=0;i<all.length;i++)if(all[i].character_id===id)return all[i];return all[0];}
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
async function renderWallet(){
  var list=$("wallet-list"),msg=$("wallet-msg"),chars=loadChars(),sum=0;list.textContent="";msg.textContent="Lade …";msg.className="msg";
  var rows=chars.map(function(c){
    var card=el("div","card row"),img=el("img","pt");img.src="https://images.evetech.net/characters/"+c.character_id+"/portrait?size=64";img.alt="";img.loading="lazy";
    var g=el("div","grow"),n=el("div","nm",c.character_name),s=el("div","sub","…"),isk=el("div","isk","…");
    g.appendChild(n);g.appendChild(s);card.appendChild(img);card.appendChild(g);card.appendChild(isk);card.style.cursor="pointer";card.onclick=function(){show("wdet",{id:c.character_id});};list.appendChild(card);return {c:c,s:s,isk:isk};
  });
  var bad=[];
  await Promise.all(rows.map(async function(r){
    try{
      if(!hasScope(r.c,"esi-wallet.read_character_wallet.v1"))throw Object.assign(new Error("Berechtigung fehlt – bitte neu einloggen."),{scope:true});
      var w=await esi(r.c,"/characters/"+r.c.character_id+"/wallet/");sum+=w;
      r.isk.textContent=short(w)+" ISK";var sm=el("small","",exact(w));r.isk.appendChild(sm);
      r.s.textContent="";
      if(hasScope(r.c,"esi-location.read_online.v1")){
        try{var o=await esi(r.c,"/characters/"+r.c.character_id+"/online/");var d=el("span","dot"+(o.online?" on":""));r.s.appendChild(d);r.s.appendChild(document.createTextNode(o.online?"online":"offline"));}catch(e){}
      }
    }catch(e){r.isk.textContent="–";r.s.textContent=e.message;if(e.expired)bad.push(r.c.character_name);}
  }));
  $("wallet-sum").textContent=short(sum)+" ISK";var ex=el("small","",exact(sum));$("wallet-sum").appendChild(ex);
  var t=new Date();msg.textContent="Abgerufen "+now();
}
var MENU=[["assets","Assets","Was du wo hast"],["pnl","Gewinne","netto pro Stück und gesamt"],["pi","Planeten (PI)","Extraktoren und Lager"],["ind","Industrie & Verträge","Jobs, Verträge, Mining"],["sync","Watchlist vom PC","Trades, Läufe, Merkliste (vom PC abgeglichen)"],["game","OmniBreaker","Spiel + Bestenliste"]];
async function statusLine(){
  var s=$("status");if(!s)return;s.textContent="";
  try{var st=await pub("/status/"),n=new Date(),dt=Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate(),11,0,0);if(dt<=n.getTime())dt+=86400000;
    s.textContent="Tranquility: "+exact(st.players)+" Piloten online · Downtime in "+fmtDur(dt-n.getTime());}catch(e){s.textContent="Serverstatus nicht abrufbar.";}
}
function renderMore(){
  var mm=$("menu");mm.textContent="";
  var sb=el("button","ghost");sb.id="b-settings";sb.style.cssText="width:100%;text-align:left;margin:0 0 8px;display:block;border-color:var(--cy)";sb.appendChild(el("div","nm","⚙ Einstellungen"));sb.appendChild(el("div","sub","Darstellung, Sprache, Leiste, Charaktere, Abgleich mit dem PC"));sb.onclick=function(){show("settings");};mm.appendChild(sb);
  MENU.forEach(function(m){if(!VIEWS[m[0]])return;var b=el("button","ghost");b.style.cssText="width:100%;text-align:left;margin:0 0 8px;display:block";b.appendChild(el("div","nm",m[1]));b.appendChild(el("div","sub",m[2]));b.onclick=function(){show(m[0]);};mm.appendChild(b);});
  statusLine();
  $("ver").textContent=VERSION+" (Beta 5)";
}
/* Einstellungen (eigene Ansicht, aus Mehr): Darstellung, Sprache, Navigationsleiste, Startbild, Charaktere, Abgleich mit dem PC */
TABOF.settings="more";
VIEWS.settings=function(sec){
  sec.textContent="";var h=el("div","row");h.style.margin="18px 0 8px";var bk=el("button","ghost","‹ Mehr");bk.style.cssText="min-height:36px;padding:4px 12px";bk.onclick=function(){show("more");};h.appendChild(bk);
  var t=el("h2","grow","Einstellungen");t.style.margin="0";h.appendChild(t);sec.appendChild(h);
  sec.appendChild(lookCard());
var lg=$("lang-opt");if(lg)lg.remove();lg=el("div","card");lg.id="lang-opt";lg.setAttribute("data-keep","1");lg.appendChild(el("div","nm","Sprache / Language"));var lr=el("div","row");lr.style.cssText="gap:8px;margin-top:8px";
[["en","English"],["de","Deutsch"]].forEach(function(o){var b=el("button",I18.lang===o[0]?"":"ghost",o[1]);b.setAttribute("data-lang",o[0]);b.style.cssText="flex:1;min-height:40px";b.onclick=function(){if(I18.set)I18.set(o[0]);};lr.appendChild(b);});lg.appendChild(lr);sec.appendChild(lg);
var np=$("nav-opt");if(np)np.remove();np=el("div","card");np.id="nav-opt";np.appendChild(el("div","nm","Navigationsleiste"));np.appendChild(el("div","sub","Wähle bis zu 4 Punkte für die untere Leiste (Mehr bleibt immer dabei)."));
var chosen=navList(),chips=el("div","row");chips.style.cssText="flex-wrap:wrap;gap:6px;margin-top:8px";
Object.keys(NAVCAT).forEach(function(k){var on=chosen.indexOf(k)>=0,b=el("button",on?"":"ghost",NAVCAT[k][0]+" "+NAVCAT[k][1]);b.style.cssText="min-height:36px;padding:4px 10px;font-size:13px";b.setAttribute("data-nav",k);
b.onclick=function(){var l=navList(),i=l.indexOf(k);if(i>=0)l.splice(i,1);else if(l.length<4)l.push(k);else{np.querySelector(".msg").textContent="Höchstens 4 – erst einen abwählen.";return;}lsSet("eve-omni-m-nav",JSON.stringify(l));renderNav();show("settings");};chips.appendChild(b);});
np.appendChild(chips);np.appendChild(el("p","msg",""));sec.appendChild(np);
var sc=null;{var lab=el("label","sub");lab.style.cssText="display:flex;gap:8px;align-items:center;margin:10px 0";sc=document.createElement("input");sc.type="checkbox";sc.id="sp-opt";sc.onchange=function(){lsSet("eve-omni-m-splash",sc.checked?"1":"0");};lab.appendChild(sc);lab.appendChild(document.createTextNode("Startbild beim Öffnen zeigen"));sec.appendChild(lab);}
sc.checked=lsGet("eve-omni-m-splash")!=="0";
  var cc=el("div","card");cc.appendChild(el("div","nm","Eingeloggte Charaktere"));var box=el("div");box.id="chars";cc.appendChild(box);
  loadChars().forEach(function(c){var r=el("div","row"),g=el("div","grow nm",c.character_name),b=el("button","ghost","Entfernen");b.style.minHeight="36px";b.style.padding="4px 12px";
    b.onclick=function(){saveChars(loadChars().filter(function(x){return x.character_id!==c.character_id;}));show(loadChars().length?"settings":null);};
    r.appendChild(g);r.appendChild(b);box.appendChild(r);});
  var ad=el("button","ghost","Weiteren Charakter einloggen");ad.style.cssText="width:100%;margin-top:8px";ad.onclick=loginStart;cc.appendChild(ad);sec.appendChild(cc);
  var sy=window.OmniM&&OmniM.syncCard?OmniM.syncCard():el("div");sec.appendChild(sy);
  if(window.OmniNotify)window.OmniNotify.card(sec,sy);   /* Benachrichtigungen (m-notify.js) vor dem PC-Abgleich; zeichnet sich dort selbst neu */
  var out=el("button","ghost","Alle ausloggen");out.id="b-out";out.style.width="100%";out.onclick=function(){saveChars([]);show();};sec.appendChild(out);
};

/* ---------- Orders + Ueberboten-Check ---------- */
async function bestAt(o,own){   /* beste Konkurrenz-Order am selben Ort (eigene Orders ausgenommen) */
  var side=o.is_buy_order?"buy":"sell",best=null,page=1,pages=1;
  do{
    var r=await esiRaw(null,"/markets/"+o.region_id+"/orders/?order_type="+side+"&type_id="+o.type_id+"&page="+page);pages=Math.min(r.pages,6);
    (await r.json()).forEach(function(x){if(x.location_id!==o.location_id||own[x.order_id])return;
      if(best===null||(o.is_buy_order?x.price>best:x.price<best))best=x.price;});
    page++;
  }while(page<=pages);
  return best;
}
async function renderOrders(){
  var list=$("orders-list"),msg=$("orders-msg"),chars=loadChars();list.textContent="";msg.textContent="Lade …";msg.className="msg";
  var all=[],own={},errs=[];
  await Promise.all(chars.map(async function(c){
    try{
      if(!hasScope(c,"esi-markets.read_character_orders.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");
      (await esi(c,"/characters/"+c.character_id+"/orders/")).forEach(function(o){o._c=c;all.push(o);own[o.order_id]=1;});
    }catch(e){errs.push(c.character_name+": "+e.message);}
  }));
  await names(all.map(function(o){return o.type_id;}).concat(all.map(function(o){return o.location_id;}).filter(function(i){return i<1e8;})));
  all.sort(function(a,b){return (a.issued<b.issued)-(a.issued>b.issued);});
  var cards=all.map(function(o){
    var card=el("div","card"),t=el("div","row"),n=el("div","grow nm",nm(o.type_id)),side=el("div","sub",(o.is_buy_order?"Kauf":"Verkauf")+" · "+(o._c.character_name));
    t.appendChild(n);var p=el("div","isk",exact(o.price)+" ISK");p.appendChild(el("small","",o.volume_remain+" / "+o.volume_total+" Stück"));t.appendChild(p);card.appendChild(t);card.appendChild(side);
    var exp=new Date(o.issued).getTime()+o.duration*86400000-Date.now();
    var loc=el("div","sub",(o.location_id<1e8?nm(o.location_id):"Struktur")+" · läuft ab in "+fmtDur(exp));card.appendChild(loc);
    var st=el("div","msg","Prüfe Konkurrenz …");card.appendChild(st);list.appendChild(card);o._st=st;o._card=card;return o;
  });
  if(!cards.length)msg.textContent=errs.length?errs.join(" · "):"Keine offenen Orders.";else{msg.textContent=(errs.length?errs.join(" · ")+" · ":"")+cards.length+" Orders · Abgerufen "+now();}
  if(msg.textContent&&errs.length)msg.className="msg bad";
  /* Konkurrenz einzeln nachladen (je Ware+Region), damit die Liste sofort steht */
  var cache={};
  await Promise.all(cards.map(async function(o){
    try{
      var key=o.region_id+":"+o.type_id+":"+o.location_id+":"+o.is_buy_order;
      if(!(key in cache))cache[key]=bestAt(o,own);
      var best=await cache[key];
      if(best===null){o._st.textContent="Keine Konkurrenz am Ort ✓";o._st.className="msg";return;}
      var lost=o.is_buy_order?best>=o.price&&best>o.price:best<o.price;
      if(!lost){o._st.textContent="Vorne ✓ (Konkurrenz: "+exact(best)+")";o._st.className="msg";return;}
      var np=newPrice(o.is_buy_order,best);o._st.className="msg bad";o._st.textContent="Überboten – bester Preis "+exact(best)+" · neu: ";
      var b=el("button","ghost",priceTxt(np));b.style.minHeight="36px";b.style.padding="2px 12px";b.onclick=function(){copy(priceTxt(np),b);};o._st.appendChild(b);
      o._card.style.borderColor="var(--bad)";
    }catch(e){o._st.textContent="Konkurrenz nicht prüfbar ("+e.message+")";}
  }));
}
/* ---------- Skills ---------- */
async function renderSkills(){
  var list=$("skills-list"),msg=$("skills-msg"),chars=loadChars();list.textContent="";msg.textContent="Lade …";msg.className="msg";
  var res=await Promise.all(chars.map(async function(c){
    try{
      if(!hasScope(c,"esi-skills.read_skillqueue.v1"))throw new Error("Berechtigung fehlt – neu einloggen.");
      return {c:c,q:await esi(c,"/characters/"+c.character_id+"/skillqueue/")};
    }catch(e){return {c:c,err:e.message};}
  }));
  var ids=[];res.forEach(function(r){(r.q||[]).forEach(function(s){ids.push(s.skill_id);});});await names(ids);
  res.forEach(function(r){
    var card=el("div","card"),row=el("div","row");row.appendChild(el("div","grow nm",r.c.character_name));card.appendChild(row);card.style.cursor="pointer";card.onclick=function(){show("sdet",{id:r.c.character_id});};
    if(r.err){card.appendChild(el("div","msg bad",r.err));list.appendChild(card);return;}
    var q=r.q.filter(function(s){return s.finish_date;}).sort(function(a,b){return a.queue_position-b.queue_position;});
    if(!q.length){card.appendChild(el("div","msg bad","Keine Skills in der Warteschlange!"));card.style.borderColor="var(--bad)";list.appendChild(card);return;}
    var cur=q[0],left=new Date(cur.finish_date).getTime()-Date.now();
    card.appendChild(el("div","sub","Jetzt: "+nm(cur.skill_id)+" auf Stufe "+cur.finish_level+" · noch "+fmtDur(left)));
    var end=new Date(q[q.length-1].finish_date).getTime()-Date.now(),warn=end<86400000;
    var e=el("div","msg"+(warn?" bad":""),"Warteschlange: "+q.length+" Skills · endet in "+fmtDur(end)+(warn?" – bald leer!":""));card.appendChild(e);
    if(warn)card.style.borderColor="var(--bad)";list.appendChild(card);
  });
  msg.textContent="Abgerufen "+now();
}
/* ---------- Charaktere (online, Standort, Schiff) ---------- */
async function renderChars(){
  var list=$("chars-list"),msg=$("chars-msg"),chars=loadChars();list.textContent="";msg.textContent="Lade …";msg.className="msg";
  var rows=await Promise.all(chars.map(async function(c){
    var d={c:c},id=c.character_id;
    async function tryget(scope,path,key){if(!hasScope(c,scope))return;try{d[key]=await esi(c,"/characters/"+id+path);}catch(e){}}
    await Promise.all([tryget("esi-location.read_online.v1","/online/","on"),tryget("esi-location.read_location.v1","/location/","loc"),tryget("esi-location.read_ship_type.v1","/ship/","ship")]);
    return d;
  }));
  var ids=[];rows.forEach(function(d){if(d.loc){ids.push(d.loc.solar_system_id);if(d.loc.station_id)ids.push(d.loc.station_id);}if(d.ship)ids.push(d.ship.ship_type_id);});await names(ids);
  rows.forEach(function(d){
    var card=el("div","card row"),img=el("img","pt");img.src="https://images.evetech.net/characters/"+d.c.character_id+"/portrait?size=64";img.alt="";img.loading="lazy";
    var g=el("div","grow"),n=el("div","nm",d.c.character_name),s1=el("div","sub");
    if(d.on){s1.appendChild(el("span","dot"+(d.on.online?" on":"")));s1.appendChild(document.createTextNode(d.on.online?"online":"offline"+(d.on.last_logout?" seit "+new Date(d.on.last_logout).toLocaleString(I18.loc,{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"")));}
    var s2=el("div","sub",d.loc?(d.loc.station_id?nm(d.loc.station_id):"im Weltraum · "+nm(d.loc.solar_system_id)):"Standort: Berechtigung fehlt");
    var s3=el("div","sub",d.ship?(d.ship.ship_name?d.ship.ship_name+" · ":"")+nm(d.ship.ship_type_id):"");
    g.appendChild(n);g.appendChild(s1);g.appendChild(s2);if(d.ship)g.appendChild(s3);card.appendChild(img);card.appendChild(g);list.appendChild(card);
  });
  msg.textContent="Abgerufen "+now();
}
/* ---------- Startbild (wie am PC: Logo, Name, Version, Links; 4 s, Tippen schliesst) ---------- */
function splash(){
var s=$("splash");if(!s||lsGet("eve-omni-m-splash")==="0")return;
try{if(sessionStorage.getItem("eve-omni-m-splash-shown"))return;sessionStorage.setItem("eve-omni-m-splash-shown","1");}catch(e){}
if(location.search.indexOf("state=")>=0)return; /* nicht direkt nach dem EVE-Login */
$("sp-ver").textContent=VERSION;s.hidden=false;
var t=setTimeout(close,4000);function close(){clearTimeout(t);s.classList.add("off");setTimeout(function(){s.hidden=true;},400);}
s.onclick=function(e){if(e.target.closest("a")){clearTimeout(t);return;}close();};
}
function chooser(){
var o=document.createElement("div");o.id="lang-pick";o.style.cssText="position:fixed;inset:0;z-index:300;background:var(--bg,#0d141c);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center";
var t=el("div","nm","Choose your language · Sprache wählen");t.style.fontSize="18px";o.appendChild(t);
[["en","English"],["de","Deutsch"]].forEach(function(x){var b=el("button","",x[1]);b.setAttribute("data-lang",x[0]);b.style.cssText="width:240px;min-height:52px;font-size:18px";b.onclick=function(){I18.set(x[0]);};o.appendChild(b);});
var n=el("div","sub","You can change this later under More · Das kannst du später unter Mehr ändern.");n.setAttribute("data-keep","1");o.appendChild(n);
document.body.appendChild(o);
}
async function main(){
if(I18.stored&&!I18.stored()&&location.search.indexOf("state=")<0&&location.search.indexOf("error=")<0){chooser();return;}
splash();
  $("b-login").onclick=loginStart;$("b-add").onclick=loginStart;
  $("b-refresh").onclick=function(){show();};
  renderNav();
  var q=new URLSearchParams(location.search);
  if(q.get("state")||q.get("error")){
    var ok=await loginFinish(q);history.replaceState(null,"","/m/");
    if(!ok){$("v-login").hidden=false;$("nav").hidden=true;return;}
  }
  var last=null;try{last=JSON.parse(sessionStorage.getItem("eve-omni-m-view"));}catch(e){}
  if(last&&last[0]&&last[0]!=="login"&&(CORE.indexOf(last[0])>=0||VIEWS[last[0]]))show(last[0],last[1]);else show("wallet");
  if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("/m/sw.js",{scope:"/m/",updateViaCache:"none"}).then(function(reg){   /* Updates: beim Öffnen/Zurückkehren nachsehen, neue Version übernimmt sofort und die Seite lädt einmal neu */
    var had=!!navigator.serviceWorker.controller,done=false;
    navigator.serviceWorker.addEventListener("controllerchange",function(){if(had&&!done){done=true;location.reload();}});
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")reg.update().catch(function(){});});
  }).catch(function(){});
}
window.OmniM={VIEWS:VIEWS,bestAt:bestAt,leave:LEAVE,loadChars:loadChars,show:show,esi:esi,esiRaw:esiRaw,pub:pub,names:names,nm:nm,el:el,copy:copy,I18:I18,now:now,hasScope:hasScope,activeChar:activeChar,lsGet:lsGet,lsSet:lsSet,$:$,fmtDur:fmtDur,tick:tick,snap:snap,newPrice:newPrice,priceTxt:priceTxt,fmtDur:fmtDur,VERSION:VERSION,SCOPES:SCOPES,b64url:b64url,jwt:jwt,short:short,exact:exact,tokFromData:tokFromData,challenge:challenge,loadChars:loadChars,saveChars:saveChars,accessToken:accessToken,loginFinish:loginFinish,errText:errText};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",main);else main();
})();

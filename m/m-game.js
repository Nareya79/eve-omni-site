/* EVEOmni Mobile – OmniBreaker (Spiel kommt aus ob-game.js/ob-game.css = automatisch aus OmniBreaker/OmniBreaker.html erzeugt).
   Hier nur die Handy-Hülle: Feld füllt den Bildschirm, ☰-Menü, Name = eingeloggter Charakter, weltweite Bestenliste. */
(function(){
"use strict";
var M=window.OmniM;if(!M||!window.OmniBreaker)return;
var URL_ONLINE="https://fluxserver01.taileafff1.ts.net:8443/omni",inst=null,onResize=null,offFs=null;
function online(){
  return {
    me:function(){try{var a=M.loadChars(),c=M.activeChar();return c&&c.character_name?{cid:String(c.character_id),n:String(c.character_name)}:null;}catch(e){return null;}},
    chars:function(){try{return M.loadChars().filter(function(c){return c&&c.character_name;}).map(function(c){return {cid:String(c.character_id),n:String(c.character_name)};});}catch(e){return [];}},   /* 4.0: im Spiel wählbar, wer in die Bestenliste kommt */
    send:function(e){return fetch(URL_ONLINE+"/score",{method:"POST",headers:{"Content-Type":"text/plain"},body:JSON.stringify(e)}).then(function(r){return r.json();});},
    top:function(l){return fetch(URL_ONLINE+"/top?l="+Number(l)).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}
  };
}
function fieldOnly(host,ctrl){
  var stage=host.querySelector(".ob-stage"),menu=document.createElement("div"),mb=document.createElement("button");
  menu.className="ob-menu";mb.type="button";mb.className="ob-menu-btn";mb.textContent="☰";mb.setAttribute("aria-label","Menü");
  menu.appendChild(host.querySelector(".ob-bar"));menu.appendChild(host.querySelector(".ob-side"));
  stage.appendChild(host.querySelector(".ob-hud"));stage.appendChild(menu);stage.appendChild(mb);
  function show(on,keep){menu.classList.toggle("open",on);mb.setAttribute("aria-expanded",on?"true":"false");if(on)ctrl.pause();else if(!keep)ctrl.resume();}
  mb.addEventListener("click",function(){show(!menu.classList.contains("open"));});
  menu.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".ob-bar button");if(b&&!/Ton|Sound/.test(b.textContent))show(false,true);});
}
/* 1.0.1: Vollbild – echtes Vollbild (Android), sonst (iPhone) deckt das Feld nur Kopfzeile + Leiste ab */
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement;}
function fullBtn(host,fit){
  var b=document.createElement("button");b.type="button";b.className="ob-full-btn";b.textContent="⛶";b.setAttribute("aria-label","Vollbild");b.setAttribute("aria-pressed","false");
  function set(on){host.classList.toggle("ob-full",on);b.setAttribute("aria-pressed",on?"true":"false");fit();}
  b.addEventListener("click",function(){
    if(host.classList.contains("ob-full")){if(fsEl())(document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(function(){});set(false);return;}
    set(true);var rq=host.requestFullscreen||host.webkitRequestFullscreen;if(rq)try{var p=rq.call(host,{navigationUI:"hide"});if(p&&p.then)p.then(lock,function(){});}catch(e){}
  });
  /* 1.0.2: im Vollbild Hochformat halten (Android; sonst still nichts) */
  function lock(){try{var o=screen.orientation;if(o&&o.lock)o.lock("portrait").catch(function(){});}catch(e){}}
  function unlock(){try{var o=screen.orientation;if(o&&o.unlock)o.unlock();}catch(e){}}
  function chg(){if(!fsEl()&&host.classList.contains("ob-full")&&host.dataset.fs)set(false);host.dataset.fs=fsEl()?"1":"";if(!fsEl())unlock();fitSoon(fit);}   /* Zurück-Geste beendet Vollbild; 1.0.2: Größe nach dem Wechsel neu (Android meldet sie verspätet) */
  document.addEventListener("fullscreenchange",chg);document.addEventListener("webkitfullscreenchange",chg);
  offFs=function(){host.classList.remove("ob-full");unlock();document.removeEventListener("fullscreenchange",chg);document.removeEventListener("webkitfullscreenchange",chg);if(fsEl())(document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(function(){});};
  host.querySelector(".ob-stage").appendChild(b);
}
function fitSoon(fit){fit();[60,250,600].forEach(function(t){setTimeout(fit,t);});}
function leave(){if(offFs){offFs();offFs=null;}if(onResize){window.removeEventListener("resize",onResize);if(window.visualViewport)visualViewport.removeEventListener("resize",onResize);onResize=null;}if(inst){try{inst.destroy();}catch(e){}inst=null;}}
M.leave.game=leave;
M.VIEWS.game=function(sec){
  leave();M.head(sec,"OmniBreaker","more");
  var host=document.createElement("div");host.className="ob-field";host.lang=M.I18.lang;sec.appendChild(host);
  inst=window.OmniBreaker.mount(host,{online:online(),storageKey:"eve-omni-m-ob-highscores",nameKey:"eve-omni-m-ob-name",progressKey:"eve-omni-m-ob-progress",defaultName:"Pilot"});
  fieldOnly(host,inst);
  var stage=host.querySelector(".ob-stage");
  /* 1.0.2: Feld 9:16 so groß wie möglich – ganze Bildschirmbreite (ohne Seitenrand), Höhe bis zur echten Leiste unten; Rest = Weltraum-Hintergrund der Hülle.
     Im Vollbild rechnet CSS selbst (100dvw/100dvh), damit veraltete Maße beim Betreten (Android) nichts ausmachen. */
  function fit(){
    if(!host.isConnected)return;
    if(host.classList.contains("ob-full")){host.style.height="";stage.style.width="min(100dvw, calc((100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * .5625))";}
    else{
      var top=Math.max(0,host.getBoundingClientRect().top),nav=document.querySelector("nav"),nb=nav&&nav.getBoundingClientRect().height?nav.getBoundingClientRect().top:window.innerHeight,avail=Math.max(200,Math.floor(nb-top));
      host.style.height=avail+"px";stage.style.width=Math.max(200,Math.floor(Math.min(document.documentElement.clientWidth,avail*0.5625)))+"px";
    }
    stage.classList.toggle("ob-sm",stage.getBoundingClientRect().width<380);
  }
  fullBtn(host,fit);onResize=function(){fitSoon(fit);};window.addEventListener("resize",onResize);if(window.visualViewport)visualViewport.addEventListener("resize",onResize);fitSoon(fit);
  if(inst&&inst.intro)setTimeout(inst.intro,300);
};
})();

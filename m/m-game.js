/* EVEOmni Mobile – OmniBreaker (Spiel kommt aus ob-game.js/ob-game.css = automatisch aus OmniBreaker/OmniBreaker.html erzeugt).
   Hier nur die Handy-Hülle: Feld füllt den Bildschirm, ☰-Menü, Name = eingeloggter Charakter, weltweite Bestenliste. */
(function(){
"use strict";
var M=window.OmniM;if(!M||!window.OmniBreaker)return;
var URL_ONLINE="https://fluxserver01.taileafff1.ts.net:8443/omni",inst=null,onResize=null;
function online(){
  return {
    me:function(){try{var a=M.loadChars(),c=M.activeChar();return c&&c.character_name?{cid:String(c.character_id),n:String(c.character_name)}:null;}catch(e){return null;}},
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
function leave(){if(onResize){window.removeEventListener("resize",onResize);onResize=null;}if(inst){try{inst.destroy();}catch(e){}inst=null;}}
M.leave.game=leave;
M.VIEWS.game=function(sec){
  leave();M.head(sec,"OmniBreaker","more");
  var host=document.createElement("div");host.className="ob-field";host.lang="de";sec.appendChild(host);
  inst=window.OmniBreaker.mount(host,{online:online(),storageKey:"eve-omni-m-ob-highscores",nameKey:"eve-omni-m-ob-name",progressKey:"eve-omni-m-ob-progress",defaultName:"Pilot"});
  fieldOnly(host,inst);
  var stage=host.querySelector(".ob-stage");
  function fit(){var top=host.getBoundingClientRect().top,avail=window.innerHeight-Math.max(top,0)-72-(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab"))||0);
    var w=Math.max(200,Math.floor(Math.min(sec.clientWidth,avail*0.8)));stage.style.width=w+"px";stage.classList.toggle("ob-sm",w<380);}
  onResize=fit;window.addEventListener("resize",fit);fit();setTimeout(fit,50);
  if(inst&&inst.intro)setTimeout(inst.intro,300);
};
})();

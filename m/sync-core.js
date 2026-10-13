/* EVEOmni Sync-Kern: Code → Adresse + Schlüssel, Ver-/Entschlüsseln im Browser (AES-GCM). Dieselbe Datei-Logik steckt auch im Desktop-Programm (Einstellungen › Daten). */
(function(root){
  "use strict";
  var ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // ohne 0/O/1/I
  var SALT = "eve-omni-sync-v1";
  function bytesToB64(b){ var s = ""; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64ToBytes(t){ t = t.replace(/-/g, "+").replace(/_/g, "/"); while (t.length % 4) t += "="; var s = atob(t), b = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
  function normalize(code){ return String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function newCode(){
    var r = new Uint8Array(20); crypto.getRandomValues(r);
    var s = ""; for (var i = 0; i < 20; i++) s += ALPHA[r[i] % 32];
    return s.replace(/(.{5})(?=.)/g, "$1-");
  }
  function validCode(code){ var n = normalize(code); return n.length === 20 && n.split("").every(function(c){ return ALPHA.indexOf(c) >= 0; }); }
  var cache = {};
  function derive(code){
    var n = normalize(code);
    if (cache[n]) return cache[n];
    var enc = new TextEncoder();
    cache[n] = crypto.subtle.importKey("raw", enc.encode(n), "PBKDF2", false, ["deriveBits"]).then(function(k){
      return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: enc.encode(SALT), iterations: 200000 }, k, 384);
    }).then(function(bits){
      var u = new Uint8Array(bits), id = ""; for (var i = 0; i < 16; i++) id += ("0" + u[i].toString(16)).slice(-2);
      return crypto.subtle.importKey("raw", u.slice(16, 48), "AES-GCM", false, ["encrypt", "decrypt"]).then(function(key){ return { id: id, key: key }; });
    });
    return cache[n];
  }
  function encrypt(code, obj){
    return derive(code).then(function(d){
      var iv = new Uint8Array(12); crypto.getRandomValues(iv);
      return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, d.key, new TextEncoder().encode(JSON.stringify(obj))).then(function(ct){
        var c = new Uint8Array(12 + ct.byteLength); c.set(iv, 0); c.set(new Uint8Array(ct), 12); return bytesToB64(c);
      });
    });
  }
  function decrypt(code, text){
    return derive(code).then(function(d){
      var c = b64ToBytes(text);
      return crypto.subtle.decrypt({ name: "AES-GCM", iv: c.slice(0, 12) }, d.key, c.slice(12));
    }).then(function(pt){ return JSON.parse(new TextDecoder().decode(pt)); });
  }
  function url(base, id){ return String(base).replace(/\/+$/, "") + "/sync/" + id; }
  function push(base, code, obj){
    return Promise.all([derive(code), encrypt(code, obj)]).then(function(a){
      return fetch(url(base, a[0].id), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ c: a[1] }) });
    }).then(function(r){ return r.json().then(function(j){ if (!r.ok) throw new Error(j.err || ("HTTP " + r.status)); return j; }); });
  }
  function pull(base, code){
    return derive(code).then(function(d){ return fetch(url(base, d.id)); }).then(function(r){
      if (r.status === 404) return null;
      return r.json().then(function(j){ if (!r.ok) throw new Error(j.err || ("HTTP " + r.status)); return decrypt(code, j.c).then(function(o){ return { data: o, v: j.v, t: j.t }; }); });
    });
  }
  root.OmniSync = { newCode: newCode, validCode: validCode, normalize: normalize, derive: derive, encrypt: encrypt, decrypt: decrypt, push: push, pull: pull };
})(typeof window !== "undefined" ? window : globalThis);

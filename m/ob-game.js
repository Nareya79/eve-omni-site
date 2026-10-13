/* AUTOMATISCH ERZEUGT von tools/omnibreaker-sync.py aus OmniBreaker/OmniBreaker.html – NICHT von Hand ändern. */
/* ===== OMNIBREAKER-SCRIPT-START =====
   Alles steckt in einem abgeschlossenen Block und legt nur EIN Objekt an: window.OmniBreaker.
   Browser-Speicher: eve-zentrale-omnibreaker-highscores, eve-zentrale-omnibreaker-name, eve-zentrale-omnibreaker-sound, -progress (Spielstand), -best (Bestwert je Level).
   Kein Netzwerk, kein ESI, keine Eingaben ans Spiel EVE. */
(function (root) {
'use strict';

/* ---------- Einstellungen ---------- */
var CFG = {
  W: 720, H: 900,
  ballR: 7.2, pegR: 10.8,   // PQ5: alle Teile 10 % kleiner = mehr Platz und größere Lücken
  gravity: 900, launchSpeed: 820, restPeg: 0.75, restWall: 0.85, maxSpeed: 1500,
  sub: 1 / 240,
  balls: 10, pegCount: 84, targets: 22, bonusPegs: 1, greenPegs: 2, boomR: 110,
  pts: { n: 10, z: 100, b: 500, g: 50 },
  catchPts: 250, restBonus: 1000, multEvery: 6, multMax: 8,
  aimMax: 1.35, launcherX: 360, launcherY: 52, muzzle: 34,
  bucketW: 108, bucketY: 872, bucketSpeed: 150,
  stuckCheck: 1.0, stuckDist: 14, shotMax: 30,
  wreckR: 18, restWreck: 1.05, gateR: 20, gateTrigger: 14, gateCd: 0.6,
  swarmMax: 6, plasmaHits: 6, tractorK: 6, tractorMax: 900, tractorMinY: 450,
  volleySpread: 0.13,
  comboMin: 5, comboStep: 5, comboK: 10,
  wellMinD: 4, chainN: 6, laserBand: 18, megaScale: 1.7, netSpeed: 780, netMax: 2,
  railHalf: 4, railRest: 0.92, railSpeed: 980, railAcc: 1600, railCd: 0.5, railRides: 3,   // PQ4: Rampen (Abprall) + Beschleunigerbahnen (Drohne fährt mit)
  restHull: 0.55, hullPush: 110,   // PT1: Frachter-Rumpf neben dem Laderaum – mittlerer Rückprall, flach liegende Drohne rollt nach außen
  stoneHalf: 6.5, stoneLen: 26, stoneStep: 22, restRail: 0.2, railFriction: 0.08,   // Rollbahn: Steindicke/-länge, Rückprall, Reibung (Anteil je Sekunde Rollen)
  stasisT: 8, slowF: 0.5, magnetR: 260, magnetK: 1500, splitN: 6, splitR: 62, gravR: 170, gravK: 2600
};
/* EN (12.10.2026): Sprache der App (eve-zentrale-lang-v1); Umschalten lädt die Seite neu, daher einmal beim Laden lesen */
var OB_EN = (function () { try { return typeof localStorage !== 'undefined' && localStorage.getItem('eve-zentrale-lang-v1') === 'en'; } catch (e) { return false; } })();
var obF = false;                                                   // true, solange Spielfeld-Texte entstehen: dann immer Englisch
function obIsEn() { return OB_EN || obF; }
function obMenu(fn) { return function () { var o = obF; obF = false; try { return fn.apply(this, arguments); } finally { obF = o; } }; }   // Menü: Sprache von EVE Omni
function obField(fn) { return function () { var o = obF; obF = true; try { return fn.apply(this, arguments); } finally { obF = o; } }; }
function tt(de, en) { return obIsEn() ? en : de; }
var OB_DICT = {
  'Punkte': 'Score', 'Drohnen': 'Drones', 'Erzadern': 'Ore veins', 'Faktor': 'Factor', 'Übung': 'Practice', 'Zufall': 'Random',
  'Neue Kampagne': 'New campaign', 'Level neu starten': 'Restart level', 'Pause': 'Pause', 'Weiter': 'Resume', 'Weiterspielen': 'Continue',
  'Übung: Level wählen (zählt nicht für den Highscore)': 'Practice: pick a level (does not count for the high score)',
  'Zielen: Maus bewegen · Schießen: Klick · Handy: ziehen und loslassen · Tastatur: ← → Leertaste · P Pause · M Ton': 'Aim: move the mouse · Fire: click · Phone: drag and release · Keyboard: ← → Space · P pause · M sound',
  'Highscore · Top 10': 'High score · Top 10', 'Highscore leeren': 'Clear high score', 'Erze & Hindernisse': 'Ores & obstacles', 'Power-Items': 'Power-ups', 'Regeln': 'Rules',
  'Noch keine Einträge. Spiel eine Kampagne!': 'No entries yet. Play a campaign!',
  'Erzader (orange): alle leeren = Level geschafft · 100': 'Ore vein (orange): clear them all = level done · 100', 'Gestein (grau) · 10': 'Rock (grey) · 10',
  'Mercoxit (lila): Bonus · 500': 'Mercoxit (purple): bonus · 500', 'Wrack: unzerstörbar, prallt stark ab': 'Wreck: indestructible, bounces hard',
  'Warp-Tor: bringt die Drohne zum Partner-Tor': 'Warp gate: sends the drone to its partner gate', 'Panzer-Brocken: brauchen 2 bis 3 Treffer': 'Armored rocks: need 2 to 3 hits',
  'Gleiter: gleiten, kreisen, pulsieren, schlagen Wellen oder fliegen Achten – Wracks, Tore und Felder wandern ab höheren Leveln mit': 'Movers: glide, orbit, pulse, wave or fly figure eights – wrecks, gates and fields move too in higher levels',
  'Gravitationsfeld (blau): zieht die Drohne an': 'Gravity field (blue): pulls the drone in', 'Abstoßfeld (rot): stößt die Drohne weg': 'Repulsor field (red): pushes the drone away',
  'Smartbombe': 'Smartbomb', 'Drohnenschwarm': 'Drone swarm', 'Plasma-Drohne': 'Plasma drone', 'Traktorstrahl': 'Tractor beam', 'Zusatzdrohne': 'Extra drone', 'Salve': 'Volley',
  'Kettenblitz': 'Chain lightning', 'Laserbahn': 'Laser line', 'Rettungsnetz': 'Safety net', 'Mega-Drohne': 'Mega drone', 'Stasis-Netz': 'Stasis web', 'Magnet-Drohne': 'Magnet drone',
  'Doppelpunkte': 'Double points', 'Bohr-Drohne': 'Drill drone', 'Zeitlupe': 'Slow motion', 'Warp-Sprung': 'Warp jump', 'Gravitationsbombe': 'Gravity bomb', 'Splitter-Drohne': 'Shrapnel drone',
  'sprengt alles im Umkreis': 'blows up everything nearby', 'teilt die Drohne in drei': 'splits the drone into three', 'Drohne durchschlägt 6 Asteroiden': 'drone punches through 6 asteroids',
  'zieht die Drohne zum Frachter': 'pulls the drone to the freighter', 'sofort eine Drohne extra': 'one extra drone right away', 'nächster Schuss = drei Drohnen': 'next shot = three drones',
  'Blitz springt auf die 6 nächsten Brocken': 'lightning jumps to the 6 nearest rocks', 'zerstört alles auf gleicher Höhe': 'destroys everything at the same height',
  'fängt die nächste verlorene Drohne auf': 'catches the next lost drone', 'riesige Drohne, trifft mehr': 'huge drone, hits more',
  'alle Bewegungen im Feld stehen 8 s still': 'everything on the field stops moving for 8 s', 'Drohne wird von Erzadern angezogen': 'drone is pulled toward ore veins',
  'doppelte Punkte für den Rest des Schusses': 'double points for the rest of the shot', 'Drohne knackt Panzer mit einem Treffer': 'drone cracks armor in one hit',
  'Zeitlupe für den Rest des Schusses': 'slow motion for the rest of the shot', 'Drohne springt über eine ferne Erzader': 'drone jumps above a distant ore vein',
  'Schwarzes Loch saugt die Drohne an': 'a black hole sucks the drone in', 'die nächsten 6 Treffer sprengen kleine Splitter': 'the next 6 hits blast small shrapnel',
  'Zufallsfeld': 'Random field', 'Zufällige Anordnung': 'Random layout', 'Zufälliges Feld': 'Random field',
  'Kampagne abgeschlossen!': 'Campaign complete!', 'Kampagne beendet': 'Campaign over', 'Game over': 'Game over', 'Übung geschafft': 'Practice cleared', 'Übung vorbei': 'Practice over',
  'Übungsmodus: kein Highscore-Eintrag.': 'Practice mode: no high score entry.', 'Nochmal': 'Again', 'Nächstes Level (Übung)': 'Next level (practice)',
  'Punkte jetzt eintragen': 'Submit score now', 'Top-10-Platz! Trag deinen Namen ein:': 'Top 10! Enter your name:', 'Eintragen': 'Submit', 'Diesmal kein Top-10-Platz.': 'No top 10 this time.',
  'Level neu versuchen': 'Retry level', 'Gespeichert.': 'Saved.', 'Klicken, Leertaste oder P zum Weiterspielen.': 'Click, Space or P to resume.', 'Hintergrund': 'Background', 'Lautstärke': 'Volume', 'Weltweite Bestenliste': 'Worldwide leaderboard', 'Punkte hochladen': 'Upload scores', 'Kampagne': 'Campaign', 'Anzeigen': 'Show', 'Lade …': 'Loading …', 'Noch keine Einträge.': 'No entries yet.', 'Bestenliste gerade nicht erreichbar.': 'Leaderboard not reachable right now.', 'Kein EVE-Charakter eingeloggt – Hochladen geht erst nach dem Login.': 'No EVE character logged in – uploading works after login.', 'Ton: an': 'Sound: on', 'Ton: aus': 'Sound: off',
  'Name für den Highscore': 'Name for the high score', 'OmniBreaker – Minispiel': 'OmniBreaker – minigame', 'Den OmniBreaker-Highscore wirklich leeren?': 'Really clear the OmniBreaker high score?',
  'SALVE BEREIT': 'VOLLEY READY', 'SALVE!': 'VOLLEY!', 'ÜBUNG': 'PRACTICE', 'Gerettet!': 'Saved!', 'Panzer geknackt!': 'Armor cracked!', 'Frachter! +1 Drohne': 'Freighter! +1 drone',
  'Rampe: die Drohne prallt ab': 'Ramp: the drone bounces off', 'Rollbahn: Drohne rollt darauf, jeder Stein leuchtet beim Berühren – abgebaute Steine lassen sie durch': 'Rolling track: the drone rolls along it, every stone lights up when touched – cleared stones let it pass', 'Beschleunigerbahn: die Drohne fährt mit und wird am Ende rausgeschossen': 'Accelerator rail: the drone rides along and is fired out at the end',
  ' · Übung (kein Highscore)': ' · practice (no high score)', 'Übungsmodus: Level wählen': 'Practice mode: pick a level'
};
/* Level-Namen und -Beschreibungen werden zusammengesetzt – Teile einzeln übersetzen */
var OB_ORE_EN = { Scordit: 'Scordite', Plagioclas: 'Plagioclase', Kernit: 'Kernite', Hemorphit: 'Hemorphite', Hedbergit: 'Hedbergite', Gneis: 'Gneiss', Dunkelocher: 'Dark Ochre', Crokit: 'Crokite' };
var OB_WORD_EN = {
  'Ringe': 'Rings', 'Spirale': 'Spiral', 'Gleiterbahnen': 'Glide Lanes', 'Bollwerk': 'Bulwark', 'Wirbelnester': 'Vortex Nests', 'Planetensystem': 'Planet System', 'Blüte': 'Bloom',
  'Säulen': 'Pillars', 'Stern': 'Star', 'Kreuzfeuer': 'Crossfire', 'Sturmfeld': 'Storm Field', 'Wellen': 'Waves', 'Pulsar': 'Pulsar', 'Achterbahn': 'Figure Eights',
  'Erster Kontakt': 'First Contact', 'Sternentor': 'Stargate', 'Der Titan': 'The Titan', 'Schwarzes Loch': 'Black Hole', 'Drifter-Schwarm': 'Drifter Swarm', 'Sansha-Festung': 'Sansha Fortress',
  'Plasmasturm': 'Plasma Storm', 'Wurmloch-Kollaps': 'Wormhole Collapse', 'Chaosfeld': 'Chaos Field', 'Das Omni-Herz': 'The Omni Heart',
  'Gegenläufige Ringe': 'Counter-rotating rings', 'Drehende Spiralarme': 'Rotating spiral arms', 'Gleitende Reihen und Wellen': 'Gliding rows and waves', 'Panzergitter mit drehendem Kern': 'Armored grid with a spinning core',
  'Kleine Wirbel, die durchs Feld driften': 'Small vortices drifting across the field', 'Ringe kreisen um ein Zentrum': 'Rings orbiting a center', 'Eine sich drehende Blüte': 'A spinning bloom',
  'Säulen gleiten auf und ab': 'Pillars glide up and down', 'Ein drehender Stern um einen Kern': 'A spinning star around a core', 'Gekreuzte Gürtel, dazwischen Gleiter': 'Crossed belts with gliders between',
  'Lockeres Feld mit wandernden Kräften': 'Loose field with wandering forces', 'Das ganze Feld schlägt Wellen': 'The whole field makes waves', 'Ringe atmen ein und aus': 'Rings breathe in and out',
  'Brocken-Gruppen fliegen Achten': 'Rock groups fly figure eights', 'Lockeres Feld mit Nestern': 'Loose field with nests', 'Gekreuzte Gürtel': 'Crossed belts', 'Ein Stern um einen Kern': 'A star around a core', 'Stehende Säulen': 'Standing pillars', 'Eine ruhende Blüte': 'A resting bloom', 'Ringe um ein Zentrum': 'Rings around a center', 'Panzergitter mit ruhendem Kern': 'Armored grid with a resting core', 'Ruhende Spiralarme': 'Resting spiral arms', 'Stehende Reihen und Wellen': 'Standing rows and waves', 'Stille Ringe': 'Still rings',
  'Kleine Nester im Feld': 'Small nests in the field', 'Wellenmuster': 'Wave pattern', 'Ringe in Ruhe': 'Rings at rest', 'Brocken-Gruppen': 'Rock groups',
  'Tore': 'gates', 'Rollbahn': 'rolling track', 'Rampen': 'ramps', 'Beschleunigerbahnen': 'accelerator rails', 'Wracks': 'wrecks', 'fahrende Wracks': 'moving wrecks', 'Schwerkraftfelder': 'gravity fields', 'wandernde Felder': 'wandering fields', 'ruhendes Feld': 'resting field',
  'Höhepunkt: zwei Ringe um ein Nest': 'Highlight: two rings around a nest', 'Höhepunkt: vier Tore um drehende Ringe': 'Highlight: four gates around spinning rings',
  'Höhepunkt: ein Titan-Rumpf, fahrende Wracks': 'Highlight: a titan hull, moving wrecks', 'Höhepunkt: Spiralarme stürzen in ein Schwarzes Loch': 'Highlight: spiral arms plunge into a black hole',
  'Höhepunkt: sechs Ringe kreisen, Abstoßer wandern': 'Highlight: six rings orbit, repulsors wander', 'Höhepunkt: Panzergitter, zwei Kernringe, wandernde Felder': 'Highlight: armored grid, two core rings, wandering fields',
  'Höhepunkt: Wellen, Gleiter, drei wandernde Felder': 'Highlight: waves, gliders, three wandering fields', 'Höhepunkt: atmende Ringe, fahrende Tore': 'Highlight: breathing rings, moving gates',
  'Höhepunkt: alles bewegt sich': 'Highlight: everything moves', 'Finale: das Herz von EVE Omni': 'Finale: the heart of EVE Omni'
};
function obT(x) { if (!obIsEn() || x == null) return x; x = String(x); return OB_DICT[x] || OB_WORD_EN[x] || x; }
function obLvName(n) {
  if (!obIsEn() || !n) return n;
  if (OB_WORD_EN[n]) return OB_WORD_EN[n];
  var m = /^([^-]+)-(.+?)( II)?$/.exec(n);
  return m ? (OB_ORE_EN[m[1]] || m[1]) + ' ' + (OB_WORD_EN[m[2]] || m[2]) + (m[3] || '') : obT(n);
}
function obLvDesc(d) {
  if (!obIsEn() || !d) return d;
  return String(d).split(' · ').map(function (part, i) {
    if (OB_WORD_EN[part] || OB_DICT[part]) return OB_WORD_EN[part] || OB_DICT[part];
    return part.split(', ').map(function (w) { var nw = /^neu: (.+)$/.exec(w); return nw ? 'new: ' + obT(nw[1]) : (OB_WORD_EN[w] || OB_DICT[w] || w); }).join(', ');
  }).join(' · ');
}
var HS_KEY = 'eve-zentrale-omnibreaker-highscores';
var NAME_KEY = 'eve-zentrale-omnibreaker-name';
var SOUND_KEY = 'eve-zentrale-omnibreaker-sound';
var BGA_KEY = 'eve-zentrale-omnibreaker-bg';   // PQ6: Deckkraft des Hintergrunds 0–100 (0 = EVE scheint durch)
var PROGRESS_KEY = 'eve-zentrale-omnibreaker-progress';
var ONLINE_KEY = 'eve-zentrale-omnibreaker-online';   // PQ7: '1' = Punkte in die weltweite Bestenliste hochladen (Standard an, '0' = aus)
var BEST_KEY = 'eve-zentrale-omnibreaker-best';   // OB5: { level: beste Level-Punkte }
var HS_MAX = 10;
var POWER_NAMES = { bomb: 'Smartbombe', swarm: 'Drohnenschwarm', plasma: 'Plasma-Drohne', tractor: 'Traktorstrahl', extra: 'Zusatzdrohne', volley: 'Salve',
  chain: 'Kettenblitz', laser: 'Laserbahn', shield: 'Rettungsnetz', mega: 'Mega-Drohne' };
var POWER_INFO = {
  bomb: 'sprengt alles im Umkreis', swarm: 'teilt die Drohne in drei',
  plasma: 'Drohne durchschlägt 6 Asteroiden', tractor: 'zieht die Drohne zum Frachter',
  extra: 'sofort eine Drohne extra', volley: 'nächster Schuss = drei Drohnen',
  chain: 'Blitz springt auf die 6 nächsten Brocken', laser: 'zerstört alles auf gleicher Höhe',
  shield: 'fängt die nächste verlorene Drohne auf', mega: 'riesige Drohne, trifft mehr',
  stasis: 'alle Bewegungen im Feld stehen 8 s still', magnet: 'Drohne wird von Erzadern angezogen',
  double: 'doppelte Punkte für den Rest des Schusses', drill: 'Drohne knackt Panzer mit einem Treffer',
  slowmo: 'Zeitlupe für den Rest des Schusses', warp: 'Drohne springt über eine ferne Erzader',
  gravity: 'Schwarzes Loch saugt die Drohne an', split: 'die nächsten 6 Treffer sprengen kleine Splitter'
};
/* OB3 (12.10.2026): neue Items und ab welchem Level sie vorkommen */
POWER_NAMES.stasis = 'Stasis-Netz'; POWER_NAMES.magnet = 'Magnet-Drohne'; POWER_NAMES.double = 'Doppelpunkte'; POWER_NAMES.drill = 'Bohr-Drohne';
POWER_NAMES.slowmo = 'Zeitlupe'; POWER_NAMES.warp = 'Warp-Sprung'; POWER_NAMES.gravity = 'Gravitationsbombe'; POWER_NAMES.split = 'Splitter-Drohne';
var POWER_UNLOCK = { stasis: 15, magnet: 21, double: 25, drill: 32, slowmo: 41, warp: 51, gravity: 61, split: 71 };

/* ---------- Hilfsfunktionen ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rnd) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(rnd() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

/* Zahlen lesbar: bis 999.999 mit Punkten, darüber Mio./Mrd. */
function fmtScore(n) {
  n = Math.floor(Number(n) || 0);
  function de(x, d) { return x.toFixed(d).replace('.', ','); }
  if (obIsEn()) { if (n >= 1e9) return (n / 1e9).toFixed(2) + ' bn'; if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M'; return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  if (n >= 1e9) return de(n / 1e9, 2) + ' Mrd.';
  if (n >= 1e6) return de(n / 1e6, 2) + ' Mio.';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ---------- Level-Aufbau ---------- */
/* verstreute Asteroiden (Zufall mit festem Startwert), optional mit Sperrkreisen */
function scatter(seed, count, avoid, minD) {
  minD = minD || 36;
  var rnd = mulberry32(seed >>> 0), cand = [], out = [];
  var rowStep = 54, colStep = 62, top = 170, bottom = CFG.H - 130;
  for (var row = 0, y = top; y <= bottom; row++, y += rowStep) {
    var off = (row % 2) ? colStep / 2 : 0;
    for (var x = 60 + off; x <= CFG.W - 60; x += colStep) {
      cand.push({ x: x + (rnd() - 0.5) * 18, y: y + (rnd() - 0.5) * 18 });
    }
  }
  shuffle(cand, rnd);
  for (var i = 0; i < cand.length && out.length < count; i++) {
    var c = cand[i], ok = true, k;
    for (k = 0; k < out.length; k++) {
      var dx = out[k].x - c.x, dy = out[k].y - c.y;
      if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
    }
    if (ok && avoid) {
      for (k = 0; k < avoid.length; k++) {
        var ax = avoid[k].x - c.x, ay = avoid[k].y - c.y;
        if (ax * ax + ay * ay < avoid[k].r * avoid[k].r) { ok = false; break; }
      }
    }
    if (ok) out.push({ x: c.x, y: c.y });
  }
  return out;
}
/* Ring aus Asteroiden; o.skip = Lücke oben (Winkel), o.w = Drehgeschwindigkeit (rad/s) */
function ring(cx, cy, rad, n, o) {
  o = o || {};
  var out = [], top = -Math.PI / 2;
  for (var i = 0; i < n; i++) {
    var a = i * 6.28318530718 / n, d = Math.abs(Math.atan2(Math.sin(a - top), Math.cos(a - top)));
    if (o.skip && d < o.skip) continue;
    var p = { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
    if (o.w) p.mv = { cx: cx, cy: cy, rad: rad, a0: a, w: o.w };
    out.push(p);
  }
  return out;
}
function spiralArm(cx, cy, r0, pitch, turns, step, phase) {
  var out = [], last = null, th = 0, thMax = turns * 6.28318530718;
  while (th <= thMax) {
    var r = r0 + th * pitch / 6.28318530718, a = th + phase, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    if (!last || Math.hypot(x - last.x, y - last.y) >= step) { out.push({ x: x, y: y }); last = { x: x, y: y }; }
    th += 0.02;
  }
  return out;
}
function diagBand(off, skipEvery) {
  var dx = 0.74, dy = 0.67, nx = -dy, ny = dx, cx = 360 + nx * off, cy = 465 + ny * off, out = [], k = 0;
  for (var t = -520; t <= 520; t += 62, k++) {
    var x = cx + dx * t, y = cy + dy * t;
    if (x < 50 || x > 670 || y < 175 || y > 770) continue;
    if (skipEvery && k % skipEvery === skipEvery - 1) continue;
    out.push({ x: x, y: y });
  }
  return out;
}
/* gleitende Reihe (links-rechts) bzw. Spalte (oben-unten); alle einer Reihe laufen im Gleichschritt */
function slide(y, xs, amp, w, a0) {
  return xs.map(function (x) { return { x: x, y: y, mv: { type: 'slide', x0: x - amp, x1: x + amp, y0: y, y1: y, w: w, a0: a0 || 0 } }; });
}
function slideV(x, ys, amp, w, a0) {
  return ys.map(function (y) { return { x: x, y: y, mv: { type: 'slide', x0: x, x1: x, y0: y - amp, y1: y + amp, w: w, a0: a0 || 0 } }; });
}
/* ganze Gruppe um einen Mittelpunkt drehen lassen (starr, deshalb überlappt nichts) */
function spin(list, cx, cy, w) {
  return list.map(function (p) { var dx = p.x - cx, dy = p.y - cy; return { x: p.x, y: p.y, mv: { cx: cx, cy: cy, rad: Math.hypot(dx, dy), a0: Math.atan2(dy, dx), w: w } }; });
}
function hexGrid(x0, x1, y0, y1, dx, dy) {
  var out = [];
  for (var row = 0, y = y0; y <= y1; row++, y += dy) for (var x = x0 + ((row % 2) ? dx / 2 : 0); x <= x1; x += dx) out.push({ x: x, y: y });
  return out;
}
function heart(cx, cy, sc, step) {
  var out = [], last = null;
  for (var t = 0; t < 6.2832; t += 0.01) {
    var x = cx + sc * 16 * Math.pow(Math.sin(t), 3), y = cy - sc * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    if (!last || Math.hypot(x - last.x, y - last.y) >= step) { out.push({ x: x, y: y }); last = { x: x, y: y }; }
  }
  if (out.length > 2 && Math.hypot(out[0].x - out[out.length - 1].x, out[0].y - out[out.length - 1].y) < step) out.pop();
  return out;
}
function mirror(list) { return list.map(function (p) { return { x: CFG.W - p.x, y: p.y }; }); }
/* Doppelte (zu nah beieinander) entfernen */
function dedupe(list, minD) {
  var out = [];
  list.forEach(function (p) { if (!out.some(function (q) { return Math.hypot(p.x - q.x, p.y - q.y) < minD; })) out.push(p); });
  return out;
}
function keepIn(list, x0, y0, x1, y1) { return list.filter(function (p) { return p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1; }); }
function noBand(list, y, h) { return list.filter(function (p) { return Math.abs(p.y - y) > h; }); }
function without(specs, avoid) {
  return specs.filter(function (s) {
    for (var k = 0; k < avoid.length; k++) {
      var dx = s.x - avoid[k].x, dy = s.y - avoid[k].y;
      if (dx * dx + dy * dy < avoid[k].r * avoid[k].r) return false;
    }
    return true;
  });
}
function circles(list, r) { return list.map(function (a) { return { x: a.x, y: a.y, r: r }; }); }

/* Typen verteilen: z = Erzader (Ziel), b = Bonus, g = Power-Item (mit .power), n = Gestein */
function assignPegs(specs, rnd, targets, bonus, powers) {
  var order = shuffle(specs.map(function (_, i) { return i; }), rnd), types = [], pw = [];
  targets = Math.min(targets, specs.length);
  for (var t = 0; t < order.length; t++) {
    var type = 'n', idx = order[t];
    if (t < targets) type = 'z';
    else if (t < targets + bonus) type = 'b';
    else if (t < targets + bonus + powers.length) { type = 'g'; pw[idx] = powers[t - targets - bonus]; }
    types[idx] = type;
  }
  return specs.map(function (p, i) {
    var shape = [];
    for (var s = 0; s < 8; s++) shape.push(0.86 + rnd() * 0.22);
    var peg = { id: i, x: p.x, y: p.y, r: CFG.pegR, t: types[i], lit: false, gone: false, rot: rnd() * 6.283, shape: shape };
    if (pw[i]) peg.power = pw[i];
    if (p.mv) peg.mv = p.mv;
    return peg;
  });
}

/* zufälliges Feld (Übungsmodus) */
function makeLayout(seed) {
  var specs = scatter(seed, CFG.pegCount);
  return assignPegs(specs, mulberry32((seed >>> 0) ^ 0x2545F491), CFG.targets, CFG.bonusPegs, ['bomb', 'bomb']);
}

/* ---- OB1/OB2 (12.10.2026): Level 31 bis 100 aus einem Baukasten, Höhepunkt alle 10 Level, viel mehr Bewegung ---- */
/* Bewegung: mv.type slide | wave (Welle) | lis (Lissajous/Acht, starre Gruppe) | epi (Ring kreist um einen Mittelpunkt) | sonst Kreisbahn
   (mit pa = Pulsieren des Radius); mv.d = zusätzliches Driften der ganzen Gruppe. Gilt für Brocken, Wracks, Tore und Felder. */
function mvAt(mv, t, o) {
  var a = mv.a0 + mv.w * t, x, y;
  if (mv.type === 'slide') { var sv = (1 + Math.sin(a)) / 2; x = mv.x0 + (mv.x1 - mv.x0) * sv; y = mv.y0 + (mv.y1 - mv.y0) * sv; }
  else if (mv.type === 'wave') { x = mv.x; y = mv.y + mv.ay * Math.sin(a + mv.k); }
  else if (mv.type === 'lis') { x = mv.x + mv.ax * Math.sin(a); y = mv.y + mv.ay * Math.sin(mv.b * a + mv.ph); }
  else if (mv.type === 'epi') { var b = mv.b0 + mv.w2 * t; x = mv.cx + mv.R * Math.cos(a) + mv.rad * Math.cos(b); y = mv.cy + mv.R * Math.sin(a) + mv.rad * Math.sin(b); }
  else { var r = mv.rad + (mv.pa ? mv.pa * Math.sin(mv.pw * t + (mv.pp || 0)) : 0); x = mv.cx + r * Math.cos(a); y = mv.cy + r * Math.sin(a); }
  if (mv.d) { var d = mv.d, e = (d.a0 || 0) + d.w * t; x += d.ax * Math.sin(e); y += d.ay * Math.sin((d.b || 1) * e + (d.ph || 0)); }
  o.x = x; o.y = y;
}
function orbitRing(cx, cy, rad, n, o) {
  o = o || {};
  return ring(cx, cy, rad, n, { skip: o.skip }).map(function (p) {
    var mv = { cx: cx, cy: cy, rad: rad, a0: Math.atan2(p.y - cy, p.x - cx), w: o.w || 0 };
    if (o.pa) { mv.pa = o.pa; mv.pw = o.pw || 1; mv.pp = o.pp || 0; }
    if (o.d) mv.d = o.d;
    return { x: p.x, y: p.y, mv: mv };
  });
}
function lisGroup(list, d) { return list.map(function (p) { return { x: p.x, y: p.y, mv: { type: 'lis', x: p.x, y: p.y, ax: d.ax, ay: d.ay, w: d.w, a0: d.a0 || 0, b: d.b || 1, ph: d.ph || 0 } }; }); }
function waveRow(y, x0, x1, step, ay, w, k, a0) {
  var o = []; for (var x = x0; x <= x1; x += step) o.push({ x: x, y: y, mv: { type: 'wave', x: x, y: y, ay: ay, w: w, a0: a0 || 0, k: x * k } }); return o;
}
function epiRings(cx, cy, R, nSub, rad, nPeg, w, w2, a0) {
  var o = [];
  for (var s = 0; s < nSub; s++) for (var j = 0; j < nPeg; j++) o.push({ x: 0, y: 0, mv: { type: 'epi', cx: cx, cy: cy, R: R, a0: (a0 || 0) + s * 6.2832 / nSub, w: w, rad: rad, b0: j * 6.2832 / nPeg + s, w2: w2 * (s % 2 ? -1 : 1) } });
  return o;
}
function pathPts(pts, step, closed) {
  var out = [], carry = 0, n = pts.length, segs = closed ? n : n - 1;
  for (var i = 0; i < segs; i++) {
    var A = pts[i], B = pts[(i + 1) % n], L = Math.hypot(B.x - A.x, B.y - A.y), t = carry;
    for (; t < L; t += step) out.push({ x: A.x + (B.x - A.x) * t / L, y: A.y + (B.y - A.y) * t / L });
    carry = t - L;
  }
  return out;
}
function starPts(cx, cy, R1, R2, k, rot) { var o = []; for (var i = 0; i < 2 * k; i++) { var a = rot + i * Math.PI / k, r = i % 2 ? R2 : R1; o.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); } return o; }
function rose(cx, cy, R, k, step) {
  var out = [], last = null;
  for (var th = 0; th < Math.PI; th += 0.004) {
    var r = R * Math.cos(k * th), x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
    if (!last || Math.hypot(x - last.x, y - last.y) >= step) { out.push({ x: x, y: y }); last = { x: x, y: y }; }
  }
  return dedupe(out, step * 0.8);
}
/* Belegung: wo können Brocken je hinkommen? (Raster 6 px, Spur über 90 s) – damit Wracks und Tore nie im Weg stehen */
function occGrid(specs, clear) {
  var S = 6, gw = Math.ceil(CFG.W / S), gh = Math.ceil(CFG.H / S), g = new Uint8Array(gw * gh), o = { x: 0, y: 0 }, rc = Math.ceil(clear / S);
  function mark(x, y) {
    var cx = Math.round(x / S), cy = Math.round(y / S);
    for (var j = -rc; j <= rc; j++) for (var i = -rc; i <= rc; i++) {
      if (i * i + j * j > rc * rc) continue;
      var X = cx + i, Y = cy + j; if (X >= 0 && Y >= 0 && X < gw && Y < gh) g[Y * gw + X] = 1;
    }
  }
  specs.forEach(function (p) { if (!p.mv) { mark(p.x, p.y); return; } for (var t = 0; t <= 90; t += 0.25) { mvAt(p.mv, t, o); mark(o.x, o.y); } });
  return { hit: function (x, y) { var X = Math.round(x / S), Y = Math.round(y / S); return X < 0 || Y < 0 || X >= gw || Y >= gh || g[Y * gw + X] === 1; },
           add: function (x, y) { mark(x, y); } };
}
function objFree(occ, x, y, mv) {
  if (!mv) return !occ.hit(x, y);
  var o = { x: 0, y: 0 };
  for (var t = 0; t <= 90; t += 0.25) { mvAt(mv, t, o); if (occ.hit(o.x, o.y) || o.x < 40 || o.x > CFG.W - 40 || o.y < 170 || o.y > 800) return false; }
  return true;
}
function objMark(occ, x, y, mv) { if (!mv) { occ.add(x, y); return; } var o = { x: 0, y: 0 }; for (var t = 0; t <= 90; t += 0.25) { mvAt(mv, t, o); occ.add(o.x, o.y); } }
/* freie Plätze für Wracks / Tore; mvOf(x, y) liefert optional eine Bewegung */
function placeFree(specs, n, rnd, clear, mvOf, far) {
  var occ = occGrid(specs, clear), cand = [], out = [], x, y;
  for (y = 200; y <= 770; y += 30) for (x = 60; x <= CFG.W - 60; x += 30) cand.push({ x: x, y: y });
  shuffle(cand, rnd);
  for (var i = 0; i < cand.length && out.length < n; i++) {
    var c = cand[i], mv = mvOf ? mvOf(c.x, c.y) : null;
    if (far && out.length % 2 === 1 && Math.hypot(c.x - out[out.length - 1].x, c.y - out[out.length - 1].y) < far) continue;
    if (!objFree(occ, c.x, c.y, mv)) continue;
    var q = { x: c.x, y: c.y }; if (mv) q.mv = mv; out.push(q); objMark(occ, c.x, c.y, mv);
  }
  return out;
}

/* Bausteine: jeder liefert { specs, wrecks?, gates?, wells? }; m = 0 (Level 31) … 1 (Level 99), sp = Tempo */
var OB_PATTERNS = [
  { noun: 'Ringe', sdesc: 'Stille Ringe', desc: 'Gegenläufige Ringe', make: function (r, m, sp) {
    var radii = m > 0.5 ? [80, 155, 230, 300] : [95, 180, 265], s = [];
    radii.forEach(function (R, i) { s = s.concat(orbitRing(360, 470, R, Math.floor(6.2832 * R / 60), { w: (i % 2 ? -1 : 1) * (0.22 + 0.2 * r()) * sp, skip: i === radii.length - 1 ? 0.3 : 0, pa: (m > 0.35 && i % 2 === 0) ? 14 : 0, pw: 1.1 * sp })); });
    return { specs: s };
  } },
  { noun: 'Spirale', sdesc: 'Ruhende Spiralarme', desc: 'Drehende Spiralarme', make: function (r, m, sp) {
    var arms = m > 0.45 ? 3 : 2, s = [], ph = r() * 6.28;
    for (var k = 0; k < arms; k++) s = s.concat(spiralArm(360, 470, 50, arms === 3 ? 120 : 100, arms === 3 ? 1.75 : 2.0, 62, ph + k * 6.2832 / arms));
    s = spin(dedupe(keepIn(s, 40, 175, 680, 790), 40), 360, 470, (r() < 0.5 ? -1 : 1) * (0.16 + 0.12 * m) * sp);
    return { specs: s.concat(orbitRing(360, 470, 305, 30, { w: -0.12 * sp, skip: 0.35 })) };
  } },
  { noun: 'Gleiterbahnen', sdesc: 'Stehende Reihen und Wellen', desc: 'Gleitende Reihen und Wellen', make: function (r, m, sp) {
    var s = [], i;
    for (i = 0; i < 7; i++) {
      var y = 220 + i * 85;
      if (i % 2) s = s.concat(waveRow(y, 70, 650, 58, 20, (0.9 + 0.6 * m) * sp, 0.012, i));
      else s = s.concat(slide(y, [100, 230, 360, 490, 620], 50, (0.7 + 0.6 * m) * sp, i * 0.8));
    }
    return { specs: s };
  } },
  { noun: 'Bollwerk', sdesc: 'Panzergitter mit ruhendem Kern', desc: 'Panzergitter mit drehendem Kern', armorAdd: 8, make: function (r, m, sp) {
    var g = without(hexGrid(60, 660, 190, 750, 66, 58), [{ x: 360, y: 470, r: 135 }]);
    return { specs: g.concat(orbitRing(360, 470, 72, 7, { w: (0.7 + 0.5 * m) * sp, pa: m > 0.4 ? 18 : 0, pw: 1.3 })) };
  } },
  { noun: 'Wirbelnester', sdesc: 'Kleine Nester im Feld', desc: 'Kleine Wirbel, die durchs Feld driften', make: function (r, m, sp) {
    var c = [{ x: 190, y: 300 }, { x: 530, y: 300 }, { x: 360, y: 470 }, { x: 190, y: 640 }, { x: 530, y: 640 }], s = [], dr = m > 0.25 ? 22 : 0;
    c.forEach(function (p, i) { s = s.concat(orbitRing(p.x, p.y, 58, 6, { w: (i % 2 ? -1 : 1) * (0.7 + 0.6 * m) * sp, d: dr ? { ax: dr, ay: dr * 0.7, w: 0.45 * sp, b: 2, ph: i } : null })); });
    return { specs: s.concat(scatter(r() * 1e9 >>> 0, 26, circles(c, 58 + dr + 34))) };
  } },
  { noun: 'Planetensystem', sdesc: 'Ringe um ein Zentrum', desc: 'Ringe kreisen um ein Zentrum', make: function (r, m, sp) {
    var s = epiRings(360, 470, 210, 5, 46, 5, (0.16 + 0.16 * m) * sp, 0.9 * sp, r() * 6);
    s = s.concat(orbitRing(360, 470, 72, 7, { w: -0.5 * sp, pa: m > 0.5 ? 12 : 0, pw: 1.2 }));
    return { specs: s.concat(keepIn(scatter(r() * 1e9 >>> 0, 40, [{ x: 360, y: 470, r: 300 }]), 40, 175, 680, 790)) };
  } },
  { noun: 'Blüte', sdesc: 'Eine ruhende Blüte', desc: 'Eine sich drehende Blüte', make: function (r, m, sp) {
    var k = m > 0.5 ? 5 : 3, s = spin(rose(360, 470, 265, k, 50), 360, 470, (0.14 + 0.14 * m) * sp);
    return { specs: s.concat(keepIn(scatter(r() * 1e9 >>> 0, 30, [{ x: 360, y: 470, r: 295 }]), 40, 175, 680, 790)) };
  } },
  { noun: 'Säulen', sdesc: 'Stehende Säulen', desc: 'Säulen gleiten auf und ab', make: function (r, m, sp) {
    var s = [], ys = [220, 324, 428, 532, 636, 740];
    for (var i = 0; i < 7; i++) s = s.concat(slideV(90 + i * 90, ys, 40, (0.6 + 0.6 * m) * sp, i * 0.9));
    return { specs: s };
  } },
  { noun: 'Stern', sdesc: 'Ein Stern um einen Kern', desc: 'Ein drehender Stern um einen Kern', make: function (r, m, sp) {
    var st = spin(pathPts(starPts(360, 470, 285, 130, 5, -Math.PI / 2), 52, true), 360, 470, (r() < 0.5 ? -1 : 1) * (0.12 + 0.12 * m) * sp);
    return { specs: dedupe(st, 40).concat(orbitRing(360, 470, 68, 6, { w: (0.8 + 0.5 * m) * sp })) };
  } },
  { noun: 'Kreuzfeuer', sdesc: 'Gekreuzte Gürtel', desc: 'Gekreuzte Gürtel, dazwischen Gleiter', make: function (r, m, sp) {
    var a = [-240, -120, 0, 120, 240].reduce(function (acc, o) { return acc.concat(diagBand(o)); }, []);
    var base = noBand(noBand(dedupe(a.concat(mirror(a)), 44), 330, 46), 610, 46);
    return { specs: base.concat(slide(330, [100, 230, 360, 490, 620], 50, (0.8 + 0.6 * m) * sp, 0), slide(610, [100, 230, 360, 490, 620], 50, (0.8 + 0.6 * m) * sp, Math.PI)) };
  } },
  { noun: 'Sturmfeld', sdesc: 'Lockeres Feld mit Nestern', desc: 'Lockeres Feld mit wandernden Kräften', wellsMin: 2, make: function (r, m, sp) {
    var s = scatter(r() * 1e9 >>> 0, 52), nest = [{ x: 200, y: 360 }, { x: 520, y: 600 }];
    s = without(s, circles(nest, 110));
    nest.forEach(function (p, i) { s = s.concat(orbitRing(p.x, p.y, 52, 5, { w: (i ? -1 : 1) * (0.9 + 0.5 * m) * sp, d: { ax: 30, ay: 20, w: 0.5 * sp, b: 2, ph: i * 2 } })); });
    return { specs: s };
  } },
  { noun: 'Wellen', sdesc: 'Wellenmuster', desc: 'Das ganze Feld schlägt Wellen', make: function (r, m, sp) {
    var s = [];
    for (var i = 0; i < 8; i++) s = s.concat(waveRow(215 + i * 76, 60 + (i % 2) * 29, 660, 58, 16 + 6 * m, (0.8 + 0.7 * m) * sp, 0.01 * (i % 2 ? -1 : 1), i * 0.6));
    return { specs: s };
  } },
  { noun: 'Pulsar', sdesc: 'Ringe in Ruhe', desc: 'Ringe atmen ein und aus', make: function (r, m, sp) {
    var s = [], pa = 16 + 12 * m;
    [70, 150, 230, 300].forEach(function (R, i) { s = s.concat(orbitRing(360, 470, R, Math.max(5, Math.floor(6.2832 * (R - pa) / 56)), { w: (i % 2 ? -1 : 1) * (0.15 + 0.15 * m) * sp, pa: R === 300 ? 0 : pa, pw: 1.4 * sp, skip: R === 300 ? 0.32 : 0 })); });
    return { specs: s };
  } },
  { noun: 'Achterbahn', sdesc: 'Brocken-Gruppen', desc: 'Brocken-Gruppen fliegen Achten', make: function (r, m, sp) {
    var q = [{ x: 200, y: 320 }, { x: 520, y: 320 }, { x: 200, y: 620 }, { x: 520, y: 620 }], s = [];
    q.forEach(function (c, i) {
      var g = []; for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) g.push({ x: c.x + a * 40, y: c.y + b * 40 });
      s = s.concat(lisGroup(g, { ax: 40, ay: 25, w: (0.5 + 0.4 * m) * sp, b: 2, ph: 0, a0: i * 1.57 }));
    });
    for (var y = 200; y <= 760; y += 62) s.push({ x: 360, y: y });
    return { specs: s };
  } }
];
var OB_ORES = ['Veldspar', 'Scordit', 'Pyroxeres', 'Plagioclas', 'Omber', 'Kernit', 'Jaspet', 'Hemorphit', 'Hedbergit', 'Gneis', 'Dunkelocher', 'Spodumain', 'Crokit', 'Bistot', 'Arkonor', 'Mercoxit'];
var OB_POWERS = ['bomb', 'swarm', 'plasma', 'tractor', 'extra', 'volley', 'chain', 'laser', 'shield', 'mega'];
/* Items je Level: je höher, desto mehr (OB3 hängt hier neue Items nach Stufe an) */
function obNewAt(L) { return Object.keys(POWER_UNLOCK).filter(function (k) { return POWER_UNLOCK[k] <= L; }); }
function obPowersFor(L, rnd, n) {
  var fresh = Object.keys(POWER_UNLOCK).filter(function (k) { return POWER_UNLOCK[k] === L; });
  var newer = shuffle(obNewAt(L).filter(function (k) { return fresh.indexOf(k) < 0; }), rnd), old = shuffle(OB_POWERS.slice(), rnd);
  var take = Math.min(newer.length, Math.ceil(n / 2)), out = fresh.concat(newer.slice(0, take));   // je höher, desto mehr neue
  return out.concat(old.slice(0, Math.max(0, n - out.length)));
}

/* Zusätze nach Plan: Felder, Tore, Wracks – fest oder in Bewegung */
function obExtras(b, plan, rnd) {
  var s = b.specs;
  if (plan.wells) {
    b.wells = (b.wells || []).concat([[250, 360], [470, 580], [360, 300]].slice(0, plan.wells).map(function (p, i) {
      var w = { x: p[0], y: p[1], r: 120, k: (i % 2 ? -1 : 1) * (1300 + 300 * plan.m) };
      if (plan.wellsMove) w.mv = { type: 'lis', x: p[0], y: p[1], ax: 110, ay: 70, w: 0.22 + 0.1 * i, a0: i * 2, b: 2, ph: i };
      return w;
    }));
  }
  if (plan.gates) {
    var g = placeFree(s, plan.gates * 2, rnd, CFG.gateR + CFG.pegR + 4, null, 300);
    if (g.length % 2) g.pop();
    var g0 = (b.gates || []).length; b.gates = (b.gates || []).concat(g.map(function (p, i) { return { x: p.x, y: p.y, link: g0 + (i ^ 1) }; }));
  }
  if (plan.wrecks) {
    var mvOf = plan.wrecksMove ? function (x, y) { return rnd() < 0.5 ? { type: 'slide', x0: x - 45, x1: x + 45, y0: y, y1: y, w: 0.6, a0: rnd() * 6 } : { type: 'lis', x: x, y: y, ax: 28, ay: 22, w: 0.5, a0: rnd() * 6, b: 2, ph: 0 }; } : null;
    var occ = s.concat((b.gates || []).map(function (q) { return { x: q.x, y: q.y }; }));
    b.wrecks = (b.wrecks || []).concat(placeFree(occ, plan.wrecks, rnd, 2 * CFG.wreckR + 4, mvOf));
  }
  return b;
}

/* Höhepunkte alle 10 Level, von Hand gebaut */
var OB_ALL = OB_POWERS;
var OB_PEAKS = [
  { name: 'Erster Kontakt', desc: 'Höhepunkt: zwei Ringe um ein Nest', targets: 18, armor: 0, balls: 11, powers: ['bomb', 'swarm', 'extra'],
    build: function () {
      var s = orbitRing(360, 470, 130, 13, { w: 0.25 }).concat(orbitRing(360, 470, 230, 22, { w: -0.18, skip: 0.3 }), ring(360, 470, 50, 5));
      var wr = [{ x: 80, y: 220 }, { x: 640, y: 220 }];
      return { specs: s.concat(keepIn(scatter(2010, 22, [{ x: 360, y: 470, r: 265 }].concat(circles(wr, 44))), 40, 175, 680, 790)), wrecks: wr };
    } },
  { name: 'Sternentor', desc: 'Höhepunkt: vier Tore um drehende Ringe', targets: 22, armor: 8, balls: 11, powers: ['volley', 'swarm', 'plasma', 'extra', 'tractor'],
    build: function () {
      var s = orbitRing(360, 470, 95, 9, { w: 0.5 }).concat(orbitRing(360, 470, 175, 17, { w: -0.35 }), orbitRing(360, 470, 250, 24, { w: 0.25, skip: 0.3 }));
      return { specs: s, gates: [{ x: 60, y: 200, link: 1 }, { x: 660, y: 760, link: 0 }, { x: 660, y: 200, link: 3 }, { x: 60, y: 760, link: 2 }] };
    } },
  { name: 'Der Titan', desc: 'Höhepunkt: ein Titan-Rumpf, fahrende Wracks', targets: 24, armor: 14, armor3: 2, balls: 11, powers: ['bomb', 'laser', 'chain', 'volley', 'extra'],
    build: function () {
      var hull = pathPts([{ x: 100, y: 250 }, { x: 620, y: 250 }, { x: 360, y: 760 }], 54, true);
      hull = hull.concat(pathPts([{ x: 230, y: 330 }, { x: 490, y: 330 }, { x: 360, y: 585 }], 56, true));
      return obExtras({ specs: dedupe(hull, 40).concat(orbitRing(360, 400, 40, 4, { w: 1.2 })) }, { m: 0.3, wrecks: 3, wrecksMove: true }, mulberry32(2030));
    } },
  { name: 'Schwarzes Loch', desc: 'Höhepunkt: Spiralarme stürzen in ein Schwarzes Loch', targets: 26, armor: 14, armor3: 3, balls: 11, powers: ['plasma', 'tractor', 'mega', 'swarm', 'chain', 'extra'],
    build: function () {
      var s = []; for (var k = 0; k < 3; k++) s = s.concat(spiralArm(360, 470, 70, 120, 1.7, 60, k * 2.094));
      s = spin(dedupe(keepIn(s, 40, 175, 680, 790), 40), 360, 470, 0.3);
      return { specs: s.concat(orbitRing(360, 470, 300, 30, { w: -0.15, skip: 0.32 })), wells: [{ x: 360, y: 470, r: 170, k: 2300 }] };
    } },
  { name: 'Drifter-Schwarm', desc: 'Höhepunkt: sechs Ringe kreisen, Abstoßer wandern', targets: 26, armor: 16, armor3: 4, balls: 11, powers: ['swarm', 'volley', 'laser', 'shield', 'chain', 'mega', 'extra'],
    build: function () {
      var s = epiRings(360, 470, 215, 6, 44, 5, 0.3, 1.1).concat(orbitRing(360, 470, 75, 7, { w: -0.6, pa: 16, pw: 1.4 }));
      return { specs: s, wells: [{ x: 200, y: 300, r: 110, k: -1700, mv: { type: 'lis', x: 200, y: 300, ax: 90, ay: 60, w: 0.3, a0: 0, b: 2, ph: 0 } }, { x: 520, y: 640, r: 110, k: -1700, mv: { type: 'lis', x: 520, y: 640, ax: 90, ay: 60, w: 0.27, a0: 2, b: 2, ph: 1 } }] };
    } },
  { name: 'Sansha-Festung', desc: 'Höhepunkt: Panzergitter, zwei Kernringe, wandernde Felder', targets: 28, armor: 30, armor3: 10, balls: 11, powers: ['bomb', 'laser', 'chain', 'plasma', 'mega', 'shield', 'extra'],
    build: function () {
      var g = without(hexGrid(60, 660, 190, 750, 66, 58), [{ x: 360, y: 470, r: 160 }]);
      return { specs: g.concat(orbitRing(360, 470, 55, 5, { w: 1.0 }), orbitRing(360, 470, 115, 11, { w: -0.6 })),
        wells: [{ x: 250, y: 350, r: 120, k: 1500, mv: { type: 'lis', x: 250, y: 350, ax: 110, ay: 80, w: 0.25, a0: 0, b: 2, ph: 0 } }, { x: 470, y: 600, r: 120, k: -1700, mv: { type: 'lis', x: 470, y: 600, ax: 110, ay: 80, w: 0.22, a0: 3, b: 2, ph: 1 } }] };
    } },
  { name: 'Plasmasturm', desc: 'Höhepunkt: Wellen, Gleiter, drei wandernde Felder', targets: 30, armor: 22, armor3: 6, balls: 11, powers: ['plasma', 'mega', 'chain', 'laser', 'swarm', 'volley', 'shield', 'extra'],
    build: function () {
      var s = [];
      for (var i = 0; i < 7; i++) { var y = 220 + i * 85; s = s.concat(i % 2 ? slide(y, [100, 230, 360, 490, 620], 50, 1.5, i) : waveRow(y, 70, 650, 58, 22, 1.6, 0.013, i)); }
      return obExtras({ specs: s }, { m: 1, wells: 3, wellsMove: true }, mulberry32(2070));
    } },
  { name: 'Wurmloch-Kollaps', desc: 'Höhepunkt: atmende Ringe, fahrende Tore', targets: 30, armor: 22, armor3: 8, balls: 11, powers: ['volley', 'swarm', 'plasma', 'mega', 'chain', 'laser', 'tractor', 'extra'],
    build: function () {
      var s = orbitRing(360, 470, 70, 6, { w: 0.6, pa: 16, pw: 1.6 }).concat(orbitRing(360, 470, 145, 13, { w: -0.4, pa: 16, pw: 1.6 }), orbitRing(360, 470, 215, 20, { w: 0.3, pa: 16, pw: 1.6 }), orbitRing(360, 470, 275, 26, { w: -0.2, skip: 0.32 }));
      function gv(x, a0, link) { return { x: x, y: 470, link: link, mv: { type: 'slide', x0: x, x1: x, y0: 260, y1: 680, w: 0.5, a0: a0 } }; }
      return { specs: s, gates: [gv(40, 0, 1), gv(680, Math.PI, 0), gv(40, Math.PI, 3), gv(680, 0, 2)] };
    } },
  { name: 'Chaosfeld', desc: 'Höhepunkt: alles bewegt sich', targets: 30, armor: 26, armor3: 10, balls: 11, powers: ['volley', 'chain', 'laser', 'mega', 'plasma', 'swarm', 'shield', 'extra', 'bomb'],
    build: function () { var r = mulberry32(2090); return obExtras(OB_PATTERNS[4].make(r, 1, 1.6), { m: 1, wells: 2, wellsMove: true, gates: 1, wrecks: 3, wrecksMove: true }, r); } },
  { name: 'Das Omni-Herz', desc: 'Finale: das Herz von EVE Omni', targets: 34, armor: 24, armor3: 10, balls: 12, powers: OB_ALL.slice(),
    build: function () {
      var h = dedupe(heart(360, 470, 11.5, 40).concat(without(heart(360, 480, 6.8, 40), [{ x: 360, y: 470, r: 5 }])), 38);
      var s = spin(h, 360, 500, 0.12).concat(orbitRing(360, 500, 292, 28, { w: -0.25, skip: 0.32 }));
      var wr = [0, 1, 2, 3].map(function (i) { var a = i * 1.5708 + 0.785; return { x: 0, y: 0, mv: { cx: 360, cy: 500, rad: 248, a0: a, w: 0.45 } }; });
      return { specs: s, wrecks: wr, wells: [{ x: 360, y: 300, r: 100, k: -1500, mv: { type: 'lis', x: 360, y: 300, ax: 120, ay: 30, w: 0.3, a0: 0, b: 2, ph: 0 } }] };
    } }
];
OB_PEAKS.forEach(function (d, i) { d.seed = 2000 + (i + 1) * 10; d.peak = true; var nw = obNewAt((i + 1) * 10); if (i < 9) d.powers = d.powers.concat(nw.slice(-2)); });
OB_PEAKS[9].powers = OB_POWERS.concat(Object.keys(POWER_UNLOCK));   // Finale: alle 18 Items

/* Level 1 bis 100: leicht und ruhig am Anfang, Bewegung, Panzer, Tore und Felder kommen nach und nach dazu */
var LEVELS = [];
(function () {
  var j = 0, names = {};
  for (var L = 1; L <= 100; L++) {
    if (L % 10 === 0) { LEVELS.push(Object.assign({}, OB_PEAKS[L / 10 - 1], { ramps: L >= 20 ? 2 : 0, tracks: L >= 40 ? 1 + (L >= 70 ? 1 : 0) : 0 })); continue; }   // PQ4: Höhepunkte mit beidem
    var cyc = Math.floor(j / OB_PATTERNS.length), order = shuffle(OB_PATTERNS.map(function (_, i) { return i; }), mulberry32(0xB0B + cyc));
    var pat = OB_PATTERNS[order[j % OB_PATTERNS.length]], ore = OB_ORES[j % OB_ORES.length];
    var r = mulberry32((0x51ED + L * 7919) >>> 0), m = (L - 1) / 98, sp = 0.35 + 1.15 * m;
    var plan = { m: m,
      wells: L < 11 ? 0 : Math.max(pat.wellsMin || 0, r() < 0.35 + 0.4 * m ? 1 + (m > 0.5 ? 1 : 0) + (m > 0.85 ? 1 : 0) : 0),
      gates: L >= 6 && r() < 0.3 + 0.35 * m ? 1 + (m > 0.6 && r() < 0.5 ? 1 : 0) : 0,
      wrecks: L < 3 ? 0 : Math.floor(m * 4 + r() * 2.5) };
    plan.ramps = L >= 11 && r() < 0.35 + 0.4 * m ? 1 + (m > 0.45 ? 1 : 0) : 0;   // PQ4: Rampen ab 11, Bahnen ab 31
    plan.tracks = L >= 31 && r() < 0.3 + 0.4 * m ? 1 + (m > 0.8 ? 1 : 0) : 0;
    plan.still = L % 10 === 3 || L % 10 === 7;                      // ab und zu ein ruhendes Feld zum Durchatmen
    plan.lane = L % 10 === 3 || L % 10 === 6 || L % 10 === 9 ? obLaneDef(L) : null;   // Rollbahn aus Steinen (Höhepunkte nie)
    plan.wellsMove = plan.wells && L >= 35 && !plan.still; plan.wrecksMove = plan.wrecks && L >= 45 && !plan.still;
    var name = ore + '-' + pat.noun; if (names[name]) name += ' II'; names[name] = 1;
    var feat = [];
    if (plan.lane) feat.push('Rollbahn'); if (plan.ramps) feat.push('Rampen'); if (plan.tracks) feat.push('Beschleunigerbahnen');
    if (plan.gates) feat.push('Tore'); if (plan.wrecks) feat.push(plan.wrecksMove ? 'fahrende Wracks' : 'Wracks');
    if (plan.wells) feat.push(plan.wellsMove ? 'wandernde Felder' : 'Schwerkraftfelder');
    if (plan.still) feat.unshift('ruhendes Feld');
    Object.keys(POWER_UNLOCK).forEach(function (k) { if (POWER_UNLOCK[k] === L) feat.push('neu: ' + POWER_NAMES[k]); });
    (function (L, pat, plan, sp, desc) {
      var seed = 2100 + L, pr = mulberry32(seed ^ 0x3C6EF372);
      LEVELS.push({ name: name, desc: desc, seed: seed, still: plan.still, ramps: plan.ramps, tracks: plan.tracks, lanes: plan.lane ? [plan.lane] : null, targets: Math.round(14 + 18 * plan.m),
        armor: L < 8 ? 0 : Math.round(4 + 20 * plan.m) + (pat.armorAdd || 0), armor3: L >= 30 ? Math.round(10 * plan.m) : 0,
        powers: obPowersFor(L, pr, 2 + Math.floor(plan.m * 6) + (pr() < 0.5 ? 1 : 0)),
        build: function () { var rr = mulberry32(seed ^ 0x2B992DDF); return obExtras(pat.make(rr, plan.m, sp), plan, rr); } });
    })(L, pat, plan, sp, (plan.still ? pat.sdesc : pat.desc) + (feat.length ? ' · ' + feat.join(', ') : ''));
    j++;
  }
})();

/* PQ4: Schienen – Rampe = Strecke zum Abprallen, Bahn = 3-Punkt-Linie, auf der die Drohne mitfährt. Nur auf Plätzen, wo nie ein Brocken hinkommt */
function segNear(px, py, x1, y1, x2, y2) {
  var vx = x2 - x1, vy = y2 - y1, l2 = vx * vx + vy * vy || 1, u = clamp(((px - x1) * vx + (py - y1) * vy) / l2, 0, 1), qx = x1 + vx * u, qy = y1 + vy * u;
  return { d: Math.hypot(px - qx, py - qy), u: u, x: qx, y: qy };
}
function railPath(pts) { var len = [0]; for (var i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); return { pts: pts, len: len, total: len[len.length - 1] }; }
function railAt(tr, s, o) {
  s = clamp(s, 0, tr.total); var i = 1; while (i < tr.pts.length - 1 && tr.len[i] < s) i++;
  var a = tr.pts[i - 1], b = tr.pts[i], sl = (tr.len[i] - tr.len[i - 1]) || 1, u = (s - tr.len[i - 1]) / sl;
  o.x = a.x + (b.x - a.x) * u; o.y = a.y + (b.y - a.y) * u; o.tx = (b.x - a.x) / sl; o.ty = (b.y - a.y) / sl; return o;
}
function obRails(pegs, gates, nRamp, nTrack, rnd) {
  var out = { ramps: [], tracks: [] };
  if (!nRamp && !nTrack) return out;
  var occ = occGrid(pegs.concat(gates).map(function (p) { return { x: p.x, y: p.y, mv: p.mv }; }), CFG.pegR + CFG.railHalf + 2 * CFG.ballR + 2), cand = [], x, y;   // Drohne passt zwischen Brocken und Schiene
  for (y = 200; y <= 820; y += 15) for (x = 60; x <= CFG.W - 60; x += 15) cand.push({ x: x, y: y });
  shuffle(cand, rnd);
  function free(pts) {
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 5);
      for (var k = 0; k <= n; k++) { var px = a.x + (b.x - a.x) * k / n, py = a.y + (b.y - a.y) * k / n; if (px < 24 || px > CFG.W - 24 || py < 180 || py > 830 || occ.hit(px, py)) return false; }
    }
    return true;
  }
  function mark(pts) { for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i], n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 5); for (var k = 0; k <= n; k++) occ.add(a.x + (b.x - a.x) * k / n, a.y + (b.y - a.y) * k / n); } }
  for (var i = 0; i < cand.length && (out.ramps.length < nRamp || out.tracks.length < nTrack); i++) {
    var c = cand[i], pts, wantT = out.tracks.length < nTrack && (out.ramps.length >= nRamp || i % 2), sc = [1, 0.75, 0.55][i % 3];   // wenig Platz: kürzer
    if (wantT) {
      var L = (150 + rnd() * 60) * sc, a = (rnd() < 0.5 ? 0 : Math.PI) + (rnd() - 0.5) * 1.1, bend = (rnd() < 0.5 ? -1 : 1) * (18 + rnd() * 16) * sc;
      var dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2, nx = -Math.sin(a), ny = Math.cos(a);
      pts = [{ x: c.x - dx, y: c.y - dy }, { x: c.x + nx * bend, y: c.y + ny * bend }, { x: c.x + dx, y: c.y + dy }];
    } else {
      var Lr = (80 + rnd() * 40) * Math.max(0.7, sc), ar = (rnd() - 0.5) * 1.3;
      pts = [{ x: c.x - Math.cos(ar) * Lr / 2, y: c.y - Math.sin(ar) * Lr / 2 }, { x: c.x + Math.cos(ar) * Lr / 2, y: c.y + Math.sin(ar) * Lr / 2 }];
    }
    if (!free(pts)) continue;
    mark(pts);
    if (wantT) out.tracks.push(railPath(pts)); else out.ramps.push({ x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y });
  }
  return out;
}

/* Rollbahn (Peggle-Stil): Kurve aus einzelnen Steinen, die Drohne rollt darauf, jeder berührte Stein leuchtet.
   Form je Stelle im 10er-Block: 3 = Bogen/Schanze, 6 = Welle, 9 = Acht (zwei Ringe). Ab dem 2. Block größer und mit mehr Orange.
   Mulden (Wellental, Ring innen unten) bekommen eine Lücke – sonst bliebe die Drohne darin liegen. */
function obLaneDef(L) {
  var blk = Math.floor((L - 1) / 10), pos = L % 10, g = Math.min(1, blk / 9), r = mulberry32((L * 0x9E3779B1 + 0x7F4A) >>> 0);
  var dfn = { blk: blk, g: g, cx: 230 + r() * 260, cy: 360 + r() * 240, flip: r() < 0.5 };
  if (pos === 3) { dfn.shape = blk % 2 ? 'jump' : 'arc'; dfn.w = 200 + 150 * g + r() * 40; }
  else if (pos === 6) { dfn.shape = 'wave'; dfn.w = 340 + 240 * g + r() * 40; dfn.amp = 24 + 18 * g; dfn.waves = 1.5 + Math.floor(r() * 2) * 0.5 + g; dfn.ph = r() * 6.2832; dfn.cx = 300 + r() * 120; }
  else { dfn.shape = 'eight'; dfn.R = 52 + 26 * g + r() * 8; dfn.cx = 280 + r() * 160; }
  return dfn;
}
function obLanePieces(dfn) {
  var out = [], i, a, P = Math.PI;
  function arcPts(cx, cy, R, a0, a1) { var n = Math.max(2, Math.ceil(Math.abs(a1 - a0) * R / 3)), o = []; for (i = 0; i <= n; i++) { a = a0 + (a1 - a0) * i / n; o.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R }); } return o; }
  if (dfn.shape === 'arc') {                                         // Bogen (Kuppel): Drohne rollt links oder rechts ab
    var sp = 2.2, R = dfn.w / (2 * Math.sin(sp / 2));
    out.push(arcPts(dfn.cx, dfn.cy + R, R, -P / 2 - sp / 2, -P / 2 + sp / 2));
  } else if (dfn.shape === 'jump') {                                 // Schanze: Viertel-Schale, tiefster Punkt am Ende – wirft die Drohne seitlich raus
    var a0 = 100 * P / 180, a1 = 175 * P / 180, Rj = dfn.w / (Math.cos(a0) - Math.cos(a1)), pts = arcPts(0, 0, Rj, a0, a1), mx = 0, my = 0;
    pts.forEach(function (q) { mx += q.x / pts.length; my += q.y / pts.length; });
    out.push(pts.map(function (q) { return { x: dfn.cx + (dfn.flip ? -1 : 1) * (q.x - mx), y: dfn.cy + q.y - my }; }));
  } else if (dfn.shape === 'wave') {                                 // Welle: in jedem Tal eine Lücke
    var x0 = dfn.cx - dfn.w / 2, k = 2 * P * dfn.waves / dfn.w, cur = [], gap = 26;
    for (var x = x0; x <= x0 + dfn.w + 0.01; x += 3) {
      var ph = k * (x - x0) + dfn.ph, y = dfn.cy + dfn.amp * Math.sin(ph), tr = ((ph - P / 2) % (2 * P) + 2 * P) % (2 * P);   // tr = 0 im Tal (sin = 1, unten)
      var dx = Math.min(tr, 2 * P - tr) / k;
      if (dx < gap) { if (cur.length > 1) out.push(cur); cur = []; continue; }
      cur.push({ x: x, y: y });
    }
    if (cur.length > 1) out.push(cur);
  } else {                                                           // Acht: zwei Ringe, oben Einlass, unten Auslass
    var Rr = dfn.R, ga = Math.asin(Math.min(0.9, 24 / Rr)), off = Rr + 24;
    [-1, 1].forEach(function (s) {
      var cx = dfn.cx + s * off;
      out.push(arcPts(cx, dfn.cy, Rr, -P / 2 + ga, P / 2 - ga)); out.push(arcPts(cx, dfn.cy, Rr, P / 2 + ga, 3 * P / 2 - ga));
    });
  }
  return out.filter(function (q) { return q.length > 1; });
}
function buildLane(dfn, rnd, powers) {
  var st = [], L = CFG.stoneLen, o1 = {}, o2 = {};
  obLanePieces(dfn).forEach(function (pts) {
    var tr = railPath(pts), n = tr.total <= L ? 1 : Math.max(2, Math.round((tr.total - L) / CFG.stoneStep) + 1), len = Math.min(L, tr.total), step = n > 1 ? (tr.total - len) / (n - 1) : 0;
    for (var i = 0; i < n; i++) {
      railAt(tr, i * step, o1); railAt(tr, i * step + len, o2);
      st.push({ x1: o1.x, y1: o1.y, x2: o2.x, y2: o2.y, dl: Math.min(len, step || len) - 5 });   // gezeichnet etwas kürzer: sichtbare Fugen wie bei einzelnen Steinen
    }
  });
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;                        // ganz ins Feld schieben
  st.forEach(function (s) { x0 = Math.min(x0, s.x1, s.x2); x1 = Math.max(x1, s.x1, s.x2); y0 = Math.min(y0, s.y1, s.y2); y1 = Math.max(y1, s.y1, s.y2); });
  var sx = x0 < 30 ? 30 - x0 : x1 > CFG.W - 30 ? CFG.W - 30 - x1 : 0, sy = y0 < 190 ? 190 - y0 : y1 > 790 ? 790 - y1 : 0;
  st.forEach(function (s) { s.x1 += sx; s.x2 += sx; s.y1 += sy; s.y2 += sy; s.x = (s.x1 + s.x2) / 2; s.y = (s.y1 + s.y2) / 2; s.a = Math.atan2(s.y2 - s.y1, s.x2 - s.x1); });
  var n = st.length, ord = shuffle(st.map(function (_, i) { return i; }), rnd), k = 0;   // Rollen: Orange = Ziel, Grün = Item, Violett = Bonus, sonst Blau
  var open = function (i) { var s = st[i]; return Math.abs(Math.sin(s.a)) < 0.8 && !st.some(function (o) { return o !== s && o.y < s.y - 4 && s.y - o.y < 160 && s.x >= Math.min(o.x1, o.x2) - 4 && s.x <= Math.max(o.x1, o.x2) + 4; }); };
  ord = ord.filter(open).concat(ord.filter(function (i) { return !open(i); }));
  var nz = Math.max(2, Math.round(n * (0.12 + 0.18 * dfn.g))), ng = dfn.shape === 'arc' || dfn.shape === 'jump' ? (dfn.blk ? 1 : 0) : 1, nb = dfn.shape === 'eight' ? 1 : 0;
  st.forEach(function (s) { s.t = 'n'; s.sh = dfn.shape === 'arc' || dfn.shape === 'jump' ? CFG.H : 240; });   // ohne Lücke: alles darunter liegt im Schatten
  for (; k < nz && k < n; k++) st[ord[k]].t = 'z';
  for (var j = 0; j < ng && k < n; j++, k++) { st[ord[k]].t = 'g'; st[ord[k]].power = powers && powers.length ? powers[Math.floor(rnd() * powers.length)] : 'bomb'; }
  for (j = 0; j < nb && k < n; j++, k++) st[ord[k]].t = 'b';
  return st;
}
/* Abstand eines Punkts zur nächsten Stein-Kante (Kapsel-Mittellinie) */
function laneDist(st, x, y) { var m = 1e9; for (var i = 0; i < st.length; i++) m = Math.min(m, segNear(x, y, st[i].x1, st[i].y1, st[i].x2, st[i].y2).d); return m; }
function laneShade(st, x, y) {                                     // liegt der Punkt im Schatten unter einem Stein? (Bogen/Schanze: ganz nach unten, sonst 240 px)
  for (var i = 0; i < st.length; i++) { var s = st[i]; if (x >= Math.min(s.x1, s.x2) - CFG.ballR && x <= Math.max(s.x1, s.x2) + CFG.ballR && y > s.y && y - s.y < (s.sh || 240)) return true; }
  return false;
}
function laneFree(st, q, clear, shade) {
  if (!q.mv) return laneDist(st, q.x, q.y) >= clear && !(shade && laneShade(st, q.x, q.y));
  var o = { x: 0, y: 0 }; for (var t = 0; t <= 90; t += 0.25) { mvAt(q.mv, t, o); if (laneDist(st, o.x, o.y) < clear || (shade && laneShade(st, o.x, o.y))) return false; } return true;
}
/* Brocken, Wracks, Tore und Felder aus der Bahnzone nehmen; fehlende Brocken an freien Plätzen ersetzen (gleiche Zielanzahl) */
function laneClear(b, st, rnd) {
  var cP = CFG.pegR + CFG.stoneHalf + 2 * CFG.ballR + 2, before = b.specs.length;
  b.specs = b.specs.filter(function (q) { return laneFree(st, q, cP, true); });
  b.wrecks = (b.wrecks || []).filter(function (q) { return laneFree(st, q, (q.r || CFG.wreckR) + CFG.stoneHalf + 2 * CFG.ballR + 2); });
  var gs = b.gates || [], keep = gs.map(function (q) { return laneFree(st, q, CFG.gateR + CFG.stoneHalf + 2 * CFG.ballR + 2); });
  if (gs.length) { var map = {}, ng = []; gs.forEach(function (q, i) { if (keep[i] && keep[q.link]) { map[i] = ng.length; ng.push(q); } }); b.gates = ng.map(function (q) { return { x: q.x, y: q.y, link: map[q.link], mv: q.mv }; }); }
  b.wells = (b.wells || []).filter(function (q) { return laneFree(st, q, 30 + CFG.stoneHalf + 2 * CFG.ballR); });
  var miss = before - b.specs.length; if (!miss) return;
  var occ = occGrid(b.specs.concat(b.wrecks).concat(b.gates || []), 2 * CFG.pegR + 2 * CFG.ballR + 2), cand = [], x, y;
  for (y = 200; y <= 780; y += 15) for (x = 50; x <= CFG.W - 50; x += 15) cand.push({ x: x, y: y });
  shuffle(cand, rnd);
  for (var i = 0; i < cand.length && miss > 0; i++) { var c = cand[i]; if (occ.hit(c.x, c.y) || !laneFree(st, c, cP, true)) continue; b.specs.push({ x: c.x, y: c.y }); occ.add(c.x, c.y); miss--; }
}

function buildLevel(def) {
  var b = def.build(), rnd = mulberry32(def.seed ^ 0x9e3779b1);
  if (def.still) {                                                 // ruhendes Level: alles bleibt, wo es bei t = 0 steht
    [b.specs, b.wrecks || [], b.gates || [], b.wells || []].forEach(function (l) { l.forEach(function (q) { if (q.mv) { mvAt(q.mv, 0, q); delete q.mv; } }); });
  }
  var lr = mulberry32((def.seed ^ 0x1B873593) >>> 0), stones = [];   // Rollbahn: eigener Zufall, Level ohne Bahn bleiben gleich
  (def.lanes || []).forEach(function (dfn) { var s = buildLane(dfn, lr, def.powers); laneClear(b, stones.concat(s), lr); stones = stones.concat(s); });
  var pegs = assignPegs(b.specs, rnd, Math.min(def.targets, Math.ceil(b.specs.length * 0.5)), def.bonus == null ? 1 : def.bonus, def.powers || []);
  (b.wrecks || []).forEach(function (w) {
    pegs.push({ id: pegs.length, x: w.x, y: w.y, r: w.r || CFG.wreckR, t: 'w', lit: false, gone: false, rot: rnd() * 6.283, shape: [1, 0.82, 1.08, 0.88, 1, 0.8, 1.1, 0.9], mv: w.mv });
  });
  var gates = (b.gates || []).map(function (g) { return { x: g.x, y: g.y, link: g.link, r: CFG.gateR, mv: g.mv }; });
  stones.forEach(function (s) {
    var q = { id: pegs.length, x: s.x, y: s.y, r: CFG.stoneHalf, t: s.t, lit: false, gone: false, rot: 0, shape: [1, 1, 1, 1, 1, 1, 1, 1], st: 1, x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2, a: s.a, dl: s.dl };
    if (s.power) q.power = s.power; pegs.push(q);
  });
  if (def.armor) {                                                  // Panzer-Brocken: mehrere Treffer nötig
    var ar = mulberry32((def.seed ^ 0x7f4a7c15) >>> 0), cand = pegs.filter(function (q) { return (q.t === 'n' || q.t === 'z') && !q.st; });
    shuffle(cand, ar);
    for (var k = 0; k < def.armor && k < cand.length; k++) { cand[k].hp = (def.armor3 && k < def.armor3) ? 3 : 2; cand[k].hpMax = cand[k].hp; }
  }
  var wells = (b.wells || []).map(function (w) { return { x: w.x, y: w.y, r: w.r, k: w.k, mv: w.mv }; });
  var rails = obRails(pegs, gates, def.ramps || 0, def.tracks || 0, mulberry32((def.seed ^ 0x6A09E667) >>> 0));
  return { pegs: pegs, gates: gates, wells: wells, ramps: rails.ramps, tracks: rails.tracks };
}

/* ---------- Spiel-Logik (ohne Bildschirm, deshalb testbar) ---------- */
function Game(opts) {
  opts = opts || {};
  this.reset(opts.seed, opts.level || 0);
}
/* level 0 = Zufallsfeld, 1..8 = feste Level */
Game.prototype.reset = function (seed, level) {
  this.score = 0; this.levelsCleared = 0; this.practice = false;
  this._load(level || 0, seed);
};
Game.prototype._load = function (level, seed) {
  var def, built;
  if (level >= 1 && level <= LEVELS.length) {
    def = LEVELS[level - 1]; this.level = level; this.seed = def.seed;
    this.levelName = def.name; this.levelDesc = def.desc;
    built = buildLevel(def); this.pegs = built.pegs; this.gates = built.gates; this.wells = built.wells; this.ramps = built.ramps; this.tracks = built.tracks;
    this.ballsLeft = def.balls || CFG.balls;
  } else {
    this.level = 0;
    if (seed == null) seed = Math.floor(Math.random() * 4294967294) + 1;
    this.seed = seed >>> 0; this.levelName = 'Zufallsfeld'; this.levelDesc = 'Zufällige Anordnung';
    this.pegs = makeLayout(this.seed); this.gates = []; this.wells = []; this.ramps = []; this.tracks = []; this.ballsLeft = CFG.balls;
  }
  this.rs = (this.seed ^ 0x5bd1e995) | 0;
  this.shotScore = 0; this.shotHits = 0; this.hitsTotal = 0; this.bonus = 0; this.caught = 0; this.bestCombo = 0; this.comboTotal = 0;
  this.shotCaught = false; this.volley = false; this.net = 0; this.mt = 0; this.frozen = 0; this.slow = false; this.dbl = false;
  var n = 0; for (var i = 0; i < this.pegs.length; i++) if (this.pegs[i].t === 'z') n++;
  this.targetsTotal = n; this.targetsLeft = n;
  this.status = 'aiming';            // aiming | flying | won | lost
  this.balls = []; this.aim = 0; this.time = 0; this.acc = 0;
  this.bucket = { x: CFG.W / 2, y: CFG.bucketY, w: CFG.bucketW, dir: 1 };
  this.events = []; this.levelStartScore = this.score;
  this._placePegs();
};
/* Kampagne ab einem gespeicherten Stand fortsetzen */
Game.prototype.resumeCampaign = function (level, score) {
  level = Math.max(1, Math.min(LEVELS.length, Math.floor(level) || 1));
  this.score = Math.max(0, Math.floor(score) || 0); this.levelsCleared = level - 1; this.practice = false;
  this._load(level);
  this.levelStartScore = this.score;
};
Game.prototype.hasNextLevel = function () { return this.level >= 1 && this.level < LEVELS.length; };
Game.prototype.nextLevel = function () { if (!this.hasNextLevel()) return false; this._load(this.level + 1); return true; };
Game.prototype.restartLevel = function () { this.score = this.levelStartScore; this._load(this.level, this.level === 0 ? this.seed : undefined); };
Game.prototype.clone = function () { return Object.assign(Object.create(Game.prototype), JSON.parse(JSON.stringify(this))); };
/* erste Drohne (für einfache Abfragen und Tests) */
Object.defineProperty(Game.prototype, 'ball', {
  get: function () { return this.balls && this.balls.length ? this.balls[0] : null; },
  set: function (b) { this.balls = b ? [b] : []; },
  configurable: true
});
Game.prototype._rand = function () {
  this.rs = (this.rs + 0x6D2B79F5) | 0;
  var t = Math.imul(this.rs ^ (this.rs >>> 15), 1 | this.rs);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
Game.prototype._placePegs = function () {
  var t = this.mt || 0, lists = [this.pegs, this.gates || [], this.wells || []];
  for (var k = 0; k < 3; k++) for (var i = 0; i < lists[k].length; i++) { var p = lists[k][i]; if (p.mv) mvAt(p.mv, t, p); }
};
/* Beschleunigung durch Gravitations- (k>0) und Abstoßfelder (k<0) an der Stelle x,y */
Game.prototype._wellAcc = function (x, y, out) {
  var ax = 0, ay = 0, w = this.wells;
  if (w) for (var i = 0; i < w.length; i++) {
    var dx = w[i].x - x, dy = w[i].y - y, d = Math.sqrt(dx * dx + dy * dy);
    if (d < w[i].r && d > CFG.wellMinD) { var f = w[i].k * (1 - d / w[i].r) / d; ax += dx * f; ay += dy * f; }
  }
  out.ax = ax; out.ay = ay;
};
Game.prototype.multiplier = function () {
  return Math.min(CFG.multMax, 1 + Math.floor(this.shotHits / CFG.multEvery));
};
Game.prototype.setAim = function (a) { this.aim = clamp(a, -CFG.aimMax, CFG.aimMax); };
/* x-Position der Drohne, wenn sie die Höhe py erreicht (gleiche Rechenschritte wie das Spiel) */
Game.prototype._xAtY = function (a, py) {
  var s = Math.sin(a), c = Math.cos(a), h = 1 / 240;
  var x = CFG.launcherX + s * CFG.muzzle, y = CFG.launcherY + c * CFG.muzzle, vx = s * CFG.launchSpeed, vy = c * CFG.launchSpeed;
  var acc = { ax: 0, ay: 0 }, wl = this.wells && this.wells.length;
  for (var i = 0; i < 1200 && y < py; i++) {
    if (wl) { this._wellAcc(x, y, acc); vx += acc.ax * h; vy += acc.ay * h; }
    vy += CFG.gravity * h; x += vx * h; y += vy * h;
  }
  return x;
};
/* Zielen: der Mauszeiger ist der Treffpunkt. Gesucht wird der Winkel, bei dem die Flugbahn
   (mit Schwerkraft) genau durch den Zeiger läuft. */
Game.prototype.aimAt = function (px, py) {
  var dx = px - CFG.launcherX, dy = py - CFG.launcherY;
  this.aimPoint = { x: px, y: py };
  if (dy < 60) { this.setAim(dx >= 0 ? CFG.aimMax : -CFG.aimMax); return; }
  var lo = -CFG.aimMax, hi = CFG.aimMax, N = 54, prevA = lo, prevE = this._xAtY(lo, py) - px, best = null, i, a, e;
  for (i = 1; i <= N; i++) {
    a = lo + (hi - lo) * i / N; e = this._xAtY(a, py) - px;
    if ((prevE <= 0 && e >= 0) || (prevE >= 0 && e <= 0)) {          // Nulldurchgang: genau dazwischen
      var A = prevA, B = a, EA = prevE, m, em;
      for (var k = 0; k < 40; k++) { m = (A + B) / 2; em = this._xAtY(m, py) - px; if ((EA <= 0) === (em <= 0)) { A = m; EA = em; } else B = m; }
      var root = (A + B) / 2;
      if (best === null || Math.abs(root - Math.atan2(dx, dy)) < Math.abs(best - Math.atan2(dx, dy))) best = root;
    }
    prevA = a; prevE = e;
  }
  if (best === null) best = Math.atan2(dx, dy);                      // unerreichbar (z. B. hinter der Wand): grob in Richtung
  this.setAim(best);
};
function newBall(x, y, vx, vy) {
  return { x: x, y: y, vx: vx, vy: vy, r: CFG.ballR, t: 0, cpT: 0, cx: x, cy: y, pierce: 0, tractor: false, gateCd: 0 };
}
Game.prototype.fire = function () {
  if (this.status !== 'aiming' || this.ballsLeft <= 0) return false;
  var angles = this.volley ? [-CFG.volleySpread, 0, CFG.volleySpread] : [0], volley = this.volley, self = this;
  this.balls = angles.map(function (d) {
    var a = clamp(self.aim + d, -1.5, 1.5), s = Math.sin(a), c = Math.cos(a);
    return newBall(CFG.launcherX + s * CFG.muzzle, CFG.launcherY + c * CFG.muzzle, s * CFG.launchSpeed, c * CFG.launchSpeed);
  });
  this.volley = false;
  this.ballsLeft--; this.status = 'flying'; this.shotHits = 0; this.shotScore = 0; this.acc = 0; this.shotCaught = false;
  this.events.push({ type: 'fire', aim: this.aim, volley: volley });
  return true;
};
Game.prototype._moveBucket = function (dt) {
  var bk = this.bucket, half = bk.w / 2;
  bk.x += bk.dir * CFG.bucketSpeed * dt;
  if (bk.x > CFG.W - half) { bk.x = CFG.W - half; bk.dir = -1; }
  else if (bk.x < half) { bk.x = half; bk.dir = 1; }
};
Game.prototype.update = function (dt) {
  if (!(dt > 0)) return;
  dt = Math.min(dt, 0.05);
  if (this.slow && this.status === 'flying') dt *= CFG.slowF;
  this.time += dt;
  if (this.frozen > 0) this.frozen = Math.max(0, this.frozen - dt); else this.mt = (this.mt || 0) + dt;
  this._placePegs();
  if (this.status !== 'flying') { this._moveBucket(dt); return; }
  this.acc += dt;
  while (this.acc >= CFG.sub && this.status === 'flying') { this._sub(CFG.sub); this.acc -= CFG.sub; }
};
Game.prototype._lightPeg = function (p, withBoom, ball) {
  if (p.lit || p.gone || p.t === 'w') return;
  var mult = this.multiplier();
  p.lit = true; this.shotHits++; this.hitsTotal++;
  if (this.shotHits >= CFG.comboMin && this.shotHits % CFG.comboStep === 0) this.events.push({ type: 'combo', n: this.shotHits, x: p.x, y: p.y });
  var pts = CFG.pts[p.t] * mult * (this.dbl ? 2 : 1);
  this.score += pts; this.shotScore += pts;
  if (p.t === 'z') this.targetsLeft--;
  this.events.push({ type: 'hit', id: p.id, x: p.x, y: p.y, pts: pts, t: p.t, power: p.power, mult: mult });
  if (p.t === 'g') this._power(p, p.power || 'bomb', withBoom, ball || this.balls[0]);
  if (withBoom && ball && ball.split > 0 && p.t !== 'g') {          // Splitter-Drohne: kleiner Sprengring je Treffer
    ball.split--; this.events.push({ type: 'boom', x: p.x, y: p.y, r: CFG.splitR, small: true });
    this.pegs.slice().forEach(function (q) { if (q !== p && !q.gone && !q.lit && q.t !== 'w' && Math.hypot(q.x - p.x, q.y - p.y) <= CFG.splitR) this._lightPeg(q, false, ball); }, this);
  }
};
Game.prototype._power = function (p, kind, withBoom, ball) {
  if (kind === 'bomb') { if (withBoom) this._boom(p); return; }       // keine Kettenreaktion
  if (kind === 'extra') this.ballsLeft++;
  else if (kind === 'shield') this.net = Math.min(CFG.netMax, (this.net || 0) + 1);
  else if (kind === 'mega' && ball) { ball.r = CFG.ballR * CFG.megaScale; }
  else if (kind === 'chain') {
    var near = this.pegs.filter(function (q) { return q !== p && !q.gone && !q.lit && q.t !== 'w' && q.t !== 'g'; });
    near.sort(function (a, b) { return Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y); });
    near.slice(0, CFG.chainN).forEach(function (q) {
      this.events.push({ type: 'zap', x: p.x, y: p.y, x2: q.x, y2: q.y });
      this._lightPeg(q, false, ball || this.balls[0]);
    }, this);
  }
  else if (kind === 'laser') {
    this.events.push({ type: 'beam', y: p.y });
    this.pegs.slice().forEach(function (q) {
      if (q !== p && !q.gone && !q.lit && q.t !== 'w' && Math.abs(q.y - p.y) <= CFG.laserBand) this._lightPeg(q, false, ball || this.balls[0]);
    }, this);
  }
  else if (kind === 'volley') this.volley = true;
  else if (kind === 'plasma' && ball) ball.pierce = Math.max(ball.pierce || 0, CFG.plasmaHits);
  else if (kind === 'tractor' && ball) ball.tractor = true;
  else if (kind === 'stasis') this.frozen = CFG.stasisT;
  else if (kind === 'magnet' && ball) ball.magnet = true;
  else if (kind === 'double') this.dbl = true;
  else if (kind === 'drill' && ball) ball.drill = true;
  else if (kind === 'slowmo') this.slow = true;
  else if (kind === 'split' && ball) ball.split = CFG.splitN;
  else if (kind === 'gravity') this.wells.push({ x: p.x, y: p.y, r: CFG.gravR, k: CFG.gravK, tmp: true });
  else if (kind === 'warp' && ball) {                                // springt über eine ferne, noch nicht getroffene Erzader
    var far = this.pegs.filter(function (q) { return q.t === 'z' && !q.gone && !q.lit && Math.hypot(q.x - p.x, q.y - p.y) > 150; });
    if (far.length) {
      var q = far[Math.floor(this._rand() * far.length)];
      this.events.push({ type: 'warp', x: ball.x, y: ball.y, x2: q.x, y2: q.y - q.r - ball.r - 4 });
      ball.x = q.x; ball.y = q.y - q.r - ball.r - 4; ball.vx = (this._rand() - 0.5) * 60; ball.vy = 0; ball.cx = ball.x; ball.cy = ball.y; ball.cpT = 0;
    }
  }
  else if (kind === 'swarm' && ball && this.balls.length < CFG.swarmMax) {
    var sp = Math.hypot(ball.vx, ball.vy) || CFG.launchSpeed, ang = Math.atan2(ball.vy, ball.vx);
    [-0.4, 0.4].forEach(function (d, i) {
      if (this.balls.length >= CFG.swarmMax) return;
      var a = ang + d + (this._rand() - 0.5) * 0.1;
      var nb = newBall(ball.x, ball.y, Math.cos(a) * sp, Math.sin(a) * sp);
      nb.cx = ball.x; nb.cy = ball.y; this.balls.push(nb);
    }, this);
  }
  this.events.push({ type: 'power', kind: kind, x: p.x, y: p.y });
};
Game.prototype._boom = function (src) {
  this.events.push({ type: 'boom', x: src.x, y: src.y, r: CFG.boomR });
  for (var i = 0; i < this.pegs.length; i++) {
    var q = this.pegs[i];
    if (q === src || q.gone || q.lit || q.t === 'w') continue;
    var dx = q.x - src.x, dy = q.y - src.y;
    if (dx * dx + dy * dy <= CFG.boomR * CFG.boomR) this._lightPeg(q, false, this.balls[0]);
  }
};
Game.prototype._sub = function (h) {
  this._moveBucket(h);
  for (var i = this.balls.length - 1; i >= 0 && this.status === 'flying'; i--) {
    if (this.balls[i]) this._subBall(this.balls[i], h, i);
  }
};
Game.prototype._subBall = function (b, h, idx) {
  var W = CFG.W, H = CFG.H, i, p, bk = this.bucket;
  if (b.rail && this._ride(b, h)) return;
  if (b.tractor && b.vy > 0 && b.y > CFG.tractorMinY) {
    b.vx += clamp((bk.x - b.x) * CFG.tractorK, -CFG.tractorMax, CFG.tractorMax) * h;
  }
  if (this.wells && this.wells.length) { var wa = this._wa || (this._wa = { ax: 0, ay: 0 }); this._wellAcc(b.x, b.y, wa); b.vx += wa.ax * h; b.vy += wa.ay * h; }
  if (b.magnet) {                                                    // Magnet-Drohne: zieht zur nächsten Erzader
    var mq = null, md = CFG.magnetR;
    for (i = 0; i < this.pegs.length; i++) { p = this.pegs[i]; if (p.t !== 'z' || p.gone || p.lit) continue; var dd = Math.hypot(p.x - b.x, p.y - b.y); if (dd < md) { md = dd; mq = p; } }
    if (mq && md > 1) { var mf = CFG.magnetK * (1 - md / CFG.magnetR) / md; b.vx += (mq.x - b.x) * mf * h; b.vy += (mq.y - b.y) * mf * h; }
  }
  b.vy += CFG.gravity * h;
  b.x += b.vx * h; b.y += b.vy * h;
  b.t += h; b.cpT += h; if (b.gateCd > 0) b.gateCd -= h;
  if (b.x < b.r) { b.x = b.r; if (b.vx < 0) b.vx = -b.vx * CFG.restWall; }
  else if (b.x > W - b.r) { b.x = W - b.r; if (b.vx > 0) b.vx = -b.vx * CFG.restWall; }
  if (b.y < b.r) { b.y = b.r; if (b.vy < 0) b.vy = -b.vy * CFG.restWall; }
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp > CFG.maxSpeed) { b.vx *= CFG.maxSpeed / sp; b.vy *= CFG.maxSpeed / sp; }
  b.pl = (b.pl || 0) + Math.min(sp, CFG.maxSpeed) * h;                // zurückgelegter Weg (Rollbahn: langsames Rollen ist kein Festhänger)
  for (i = 0; i < this.pegs.length; i++) {
    p = this.pegs[i];
    if (p.gone) continue;
    if (p.st) {                                    // Rollbahn-Stein: Kapsel; kleiner Rückprall, Tempo entlang der Bahn bleibt (wenig Reibung)
      if (p.used) continue;                        // abgebaut: durchlässig
      var sq = segNear(b.x, b.y, p.x1, p.y1, p.x2, p.y2), sr = b.r + p.r;
      if (sq.d >= sr) continue;
      var snx, sny;
      if (sq.d > 0.0001) { snx = (b.x - sq.x) / sq.d; sny = (b.y - sq.y) / sq.d; } else { snx = Math.sin(p.a); sny = -Math.cos(p.a); if (sny > 0) { snx = -snx; sny = -sny; } }
      b.x = sq.x + snx * sr; b.y = sq.y + sny * sr; b.onSt = true;
      var svn = b.vx * snx + b.vy * sny;
      if (svn < 0) {
        b.vx -= (1 + CFG.restRail) * svn * snx; b.vy -= (1 + CFG.restRail) * svn * sny;
        var stx = -sny, sty = snx, svt = b.vx * stx + b.vy * sty, sf = svt * CFG.railFriction * h;
        b.vx -= sf * stx; b.vy -= sf * sty;
      }
      this._lightPeg(p, true, b);
      continue;
    }
    var dx = b.x - p.x, dy = b.y - p.y, rr = b.r + p.r, d2 = dx * dx + dy * dy;
    if (d2 >= rr * rr) continue;
    if (p.t !== 'w' && b.pierce > 0) {            // Plasma: durchschlägt statt abzuprallen
      if (!p.lit) { b.pierce--; this._lightPeg(p, true, b); }
      continue;
    }
    var d = Math.sqrt(d2) || 0.0001, nx = dx / d, ny = dy / d, rest = p.t === 'w' ? CFG.restWreck : CFG.restPeg;
    b.x = p.x + nx * rr; b.y = p.y + ny * rr;
    var vn = b.vx * nx + b.vy * ny;
    if (vn < 0) {
      b.vx -= (1 + rest) * vn * nx; b.vy -= (1 + rest) * vn * ny;
      if (p.t === 'w' && vn < -80) this.events.push({ type: 'bump', x: p.x, y: p.y, id: p.id });
    }
    if (p.hp > 1 && p.t !== 'w' && b.drill) p.hp = 1;                // Bohr-Drohne knackt Panzer sofort
    if (p.hp > 1 && p.t !== 'w') { p.hp--; this.events.push({ type: 'armor', x: p.x, y: p.y, id: p.id, hp: p.hp }); }   // Panzer: Treffer zählt erst beim letzten
    else this._lightPeg(p, true, b);
  }
  for (i = 0; i < this.gates.length && b.gateCd <= 0; i++) {
    var gt = this.gates[i], gx = b.x - gt.x, gy = b.y - gt.y;
    if (gt.link != null && this.gates[gt.link] && gx * gx + gy * gy < CFG.gateTrigger * CFG.gateTrigger) {
      var o = this.gates[gt.link];
      this.events.push({ type: 'warp', x: gt.x, y: gt.y, x2: o.x, y2: o.y });
      b.x = o.x; b.y = o.y; b.cx = o.x; b.cy = o.y; b.cpT = 0; b.gateCd = CFG.gateCd;
    }
  }
  this._rails(b, h);
  this._hull(b);
  if (b.vy > 0 && b.y >= bk.y && Math.abs(b.x - bk.x) <= bk.w / 2) { this._removeBall(idx, 'catch'); return; }
  if (b.y - b.r > H) {
    if (this.net > 0 && b.vy > 0) {                                   // Rettungsnetz fängt die Drohne auf
      this.net--; b.y = H - b.r - 2; b.vy = -Math.max(CFG.netSpeed, Math.abs(b.vy) * 0.9); b.cx = b.x; b.cy = b.y; b.cpT = 0;
      this.events.push({ type: 'net', x: b.x, y: H - 6 });
    } else { this._removeBall(idx, 'out'); return; }
  }
  if (b.cpT >= CFG.stuckCheck) {
    var mx = b.x - b.cx, my = b.y - b.cy;
    if (Math.sqrt(mx * mx + my * my) < CFG.stuckDist && !(b.onSt && b.pl > 2 * CFG.stuckDist)) this._unstick(b);
    b.cx = b.x; b.cy = b.y; b.cpT = 0; b.pl = 0; b.onSt = false;
  }
  if (b.t > CFG.shotMax) this._removeBall(idx, 'timeout');
};
/* PT1: Frachter-Rumpf ist fest – Seitendecks/Heck (bis ±114 px) und die Schachtpfeiler; nur der offene Laderaum fängt.
   Maße wie in drawFreighterNew (relativ zur Fanglinie bk.y): Pfeiler y −14…20, Deck y −6…29. */
Game.prototype._hullBoxes = function () {
  var bk = this.bucket, hw = bk.w / 2, x = bk.x, y = bk.y;
  return [[x - 114, y - 6, x - hw - 6, y + 29], [x + hw + 6, y - 6, x + 114, y + 29],      // Rumpf links/rechts
          [x - hw - 6, y - 14, x - hw, y + 20], [x + hw, y - 14, x + hw + 6, y + 20]];     // Schachtpfeiler
};
Game.prototype._hull = function (b) {
  var bx = this._hullBoxes(), bk = this.bucket, vb = bk.dir * CFG.bucketSpeed;
  for (var i = 0; i < bx.length; i++) {
    var r = bx[i], qx = clamp(b.x, r[0], r[2]), qy = clamp(b.y, r[1], r[3]), dx = b.x - qx, dy = b.y - qy, d2 = dx * dx + dy * dy;
    if (d2 >= b.r * b.r) continue;
    var d = Math.sqrt(d2), nx, ny;
    if (d > 0.0001) { nx = dx / d; ny = dy / d; } else { nx = 0; ny = -1; d = 0; }   // Mittelpunkt im Kasten: nach oben raus
    b.x += nx * (b.r - d); b.y += ny * (b.r - d);
    var rvx = b.vx - vb, vn = rvx * nx + b.vy * ny;                     // relativ zum fahrenden Frachter
    if (vn < 0) {
      b.vx -= (1 + CFG.restHull) * vn * nx; b.vy -= (1 + CFG.restHull) * vn * ny;
      if (vn < -80) this.events.push({ type: 'bump', x: qx, y: qy, id: 'hull' });
    }
    if (ny < -0.7 && Math.abs(b.vy) < 120) b.vx += (b.x < bk.x ? -1 : 1) * CFG.hullPush * CFG.sub * 8;   // liegt oben auf: rollt nach außen ab
  }
};
Game.prototype._hullTouch = function (x, y) {
  var bx = this._hullBoxes(), r = CFG.ballR;
  for (var i = 0; i < bx.length; i++) { var qx = clamp(x, bx[i][0], bx[i][2]), qy = clamp(y, bx[i][1], bx[i][3]); if ((x - qx) * (x - qx) + (y - qy) * (y - qy) < r * r) return true; }
  return false;
};
/* PQ4: Rampen werfen zurück, Bahnen nehmen die Drohne mit */
Game.prototype._rails = function (b, h) {
  var i, q, rr = b.r + CFG.railHalf;
  for (i = 0; i < (this.ramps || []).length; i++) {
    var rp = this.ramps[i]; q = segNear(b.x, b.y, rp.x1, rp.y1, rp.x2, rp.y2);
    if (q.d >= rr) continue;
    var nx, ny;
    if (q.d > 0.001) { nx = (b.x - q.x) / q.d; ny = (b.y - q.y) / q.d; } else { var nl = Math.hypot(rp.x2 - rp.x1, rp.y2 - rp.y1) || 1; nx = -(rp.y2 - rp.y1) / nl; ny = (rp.x2 - rp.x1) / nl; }
    b.x = q.x + nx * rr; b.y = q.y + ny * rr;
    var vn = b.vx * nx + b.vy * ny;
    if (vn < 0) { b.vx -= (1 + CFG.railRest) * vn * nx; b.vy -= (1 + CFG.railRest) * vn * ny; if (vn < -80) this.events.push({ type: 'ramp', x: q.x, y: q.y }); }
  }
  if (b.railCd > 0) { b.railCd -= h; return; }
  if ((b.rides || 0) >= CFG.railRides) return;                        // keine Endlosschleife aus Bahnen, Rampen und Toren
  for (i = 0; i < (this.tracks || []).length; i++) {
    var tr = this.tracks[i], best = null, k;
    for (k = 1; k < tr.pts.length; k++) { q = segNear(b.x, b.y, tr.pts[k - 1].x, tr.pts[k - 1].y, tr.pts[k].x, tr.pts[k].y); if (!best || q.d < best.d) { best = q; best.s = tr.len[k - 1] + q.u * (tr.len[k] - tr.len[k - 1]); } }
    if (best.d >= rr) continue;
    var o = railAt(tr, best.s, {}), dir = (b.vx * o.tx + b.vy * o.ty) >= 0 ? 1 : -1;
    b.rail = { k: i, s: best.s, dir: dir, v: Math.max(350, Math.hypot(b.vx, b.vy)) }; b.rides = (b.rides || 0) + 1;
    this.events.push({ type: 'rail', x: o.x, y: o.y });
    return;
  }
};
Game.prototype._ride = function (b, h) {
  var R = b.rail, tr = this.tracks && this.tracks[R.k];
  if (!tr) { delete b.rail; return false; }
  R.v = Math.min(CFG.railSpeed, R.v + CFG.railAcc * h); R.s += R.dir * R.v * h;
  var o = railAt(tr, R.s, {});
  b.x = o.x; b.y = o.y; b.vx = o.tx * R.dir * R.v; b.vy = o.ty * R.dir * R.v;
  b.t += h; b.cx = b.x; b.cy = b.y; b.cpT = 0;
  if (R.s <= 0 || R.s >= tr.total) { delete b.rail; b.railCd = CFG.railCd; this.events.push({ type: 'railOut', x: b.x, y: b.y }); }
  return true;
};
Game.prototype._removeBall = function (idx, reason) {
  this.balls.splice(idx, 1);
  if (reason === 'catch') {
    this.caught++; this.score += CFG.catchPts;
    var free = !this.shotCaught;                 // nur die erste gefangene Drohne einer Runde gibt eine Gratis-Drohne
    if (free) { this.shotCaught = true; this.ballsLeft++; }
    this.events.push({ type: 'catch', x: this.bucket.x, y: this.bucket.y, pts: CFG.catchPts, free: free });
  }
  if (!this.balls.length) this._endShot(this.shotCaught ? 'catch' : reason);
};
Game.prototype._unstick = function (b) {
  b = b || this.balls[0];
  var removed = 0;
  for (var i = 0; i < this.pegs.length; i++) {
    var p = this.pegs[i];
    if (p.gone || !p.lit || p.st) continue;                          // Rollbahn-Steine bleiben immer
    var dx = p.x - b.x, dy = p.y - b.y, lim = b.r + p.r + 14;
    if (dx * dx + dy * dy <= lim * lim) { p.gone = true; removed++; this.events.push({ type: 'gone', x: p.x, y: p.y, t: p.t }); }
  }
  if (!removed) { b.vx += (this._rand() - 0.5) * 300; b.vy -= 150; }
  this.events.push({ type: 'unstick' });
};
/* Combo-Bonus: ab 5 Treffern mit einer Runde, wächst schnell: 10 Treffer = 600, 20 = 3.200, 30 = 7.800 */
Game.comboBonus = function (hits) { return hits >= CFG.comboMin ? CFG.comboK * hits * (hits - CFG.comboMin + 1) : 0; };
Game.prototype._endShot = function (reason) {
  var i, p;
  this.balls = [];
  if (this.shotHits > this.bestCombo) this.bestCombo = this.shotHits;
  var cb = Game.comboBonus(this.shotHits);
  if (cb > 0) { this.score += cb; this.shotScore += cb; this.comboTotal += cb; this.events.push({ type: 'comboBonus', hits: this.shotHits, pts: cb }); }
  for (i = 0; i < this.pegs.length; i++) {
    p = this.pegs[i];
    if (p.lit && !p.gone) { if (p.st) { p.used = true; continue; } p.gone = true; this.events.push({ type: 'gone', x: p.x, y: p.y, t: p.t }); }   // Steine: verbraucht, bleiben fest
  }
  this.slow = false; this.dbl = false; this.wells = (this.wells || []).filter(function (w) { return !w.tmp; });
  this.events.push({ type: 'shotEnd', reason: reason, shotScore: this.shotScore });
  if (this.targetsLeft <= 0) {
    this.bonus = this.ballsLeft * CFG.restBonus;
    this.score += this.bonus;
    this.status = 'won';
    if (!this.practice && this.level >= 1) this.levelsCleared++;
    this.events.push({ type: 'won', bonus: this.bonus });
  } else if (this.ballsLeft <= 0) {
    this.status = 'lost';
    this.events.push({ type: 'lost' });
  } else {
    this.status = 'aiming';
  }
};
Game.prototype._railTouch = function (x, y, rr) {
  var i, k, l = this.ramps || [], t = this.tracks || [];
  for (i = 0; i < l.length; i++) if (segNear(x, y, l[i].x1, l[i].y1, l[i].x2, l[i].y2).d < rr) return true;
  for (i = 0; i < t.length; i++) for (k = 1; k < t[i].pts.length; k++) if (segNear(x, y, t[i].pts[k - 1].x, t[i].pts[k - 1].y, t[i].pts[k].x, t[i].pts[k].y).d < rr) return true;
  return false;
};
/* Zielhilfe: Flugbahn bis zum ersten Treffer */
Game.prototype.predict = function (angle) {
  var a = angle == null ? this.aim : angle, s = Math.sin(a), c = Math.cos(a), h = 1 / 240;
  var x = CFG.launcherX + s * CFG.muzzle, y = CFG.launcherY + c * CFG.muzzle;
  var vx = s * CFG.launchSpeed, vy = c * CFG.launchSpeed, pts = [{ x: x, y: y }];
  var acc = { ax: 0, ay: 0 }, wl = this.wells && this.wells.length;
  for (var i = 0; i < 480; i++) {
    if (wl) { this._wellAcc(x, y, acc); vx += acc.ax * h; vy += acc.ay * h; }
    vy += CFG.gravity * h; x += vx * h; y += vy * h;
    if (x < CFG.ballR) { x = CFG.ballR; vx = -vx * CFG.restWall; }
    else if (x > CFG.W - CFG.ballR) { x = CFG.W - CFG.ballR; vx = -vx * CFG.restWall; }
    var hit = false;
    for (var k = 0; k < this.pegs.length; k++) {
      var p = this.pegs[k];
      if (p.gone) continue;
      if (p.st) { if (!p.used && segNear(x, y, p.x1, p.y1, p.x2, p.y2).d < CFG.ballR + p.r) { hit = true; break; } continue; }   // Rollbahn (abgebaut: durchlässig)
      var dx = x - p.x, dy = y - p.y, rr = CFG.ballR + p.r;
      if (dx * dx + dy * dy < rr * rr) { hit = true; break; }
    }
    if (!hit) hit = this._railTouch(x, y, CFG.ballR + CFG.railHalf);
    if (!hit && y > CFG.bucketY - 30) hit = this._hullTouch(x, y);   // PT1: Zielhilfe endet am Frachter-Rumpf
    if (hit) { pts.push({ x: x, y: y, hit: true }); break; }
    if (i % 4 === 0) pts.push({ x: x, y: y });
    if (y > CFG.H) break;
  }
  return pts;
};

/* ---------- Highscore (Top 10, im Browser gespeichert) ---------- */
var Highscores = {
  KEY: HS_KEY, NAME_KEY: NAME_KEY, MAX: HS_MAX,
  cleanName: function (s) {
    s = String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 24);
    return s || 'Unbekannt';
  },
  sort: function (list) {
    // stabil: bei gleicher Punktzahl bleibt der ältere Eintrag oben
    return list.map(function (e, i) { return { e: e, i: i }; })
      .sort(function (a, b) { return (b.e.score - a.e.score) || (a.i - b.i); })
      .map(function (x) { return x.e; });
  },
  load: function (store, key) {
    var raw, arr;
    try { raw = store.getItem(key || HS_KEY); arr = raw ? JSON.parse(raw) : []; } catch (e) { arr = []; }
    if (!Array.isArray(arr)) arr = [];
    var out = [];
    arr.forEach(function (e) {
      if (!e || typeof e !== 'object') return;
      var sc = Number(e.score);
      if (!isFinite(sc) || sc < 0) return;
      out.push({
        name: Highscores.cleanName(e.name), score: Math.floor(sc),
        date: typeof e.date === 'string' ? e.date : '', seed: Number(e.seed) || 0,
        lvl: Math.max(0, Math.floor(Number(e.lvl) || 0)), won: !!e.won
      });
    });
    return Highscores.sort(out).slice(0, HS_MAX);
  },
  save: function (store, key, list) {
    try { store.setItem(key || HS_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  },
  qualifies: function (list, score) {
    score = Math.floor(Number(score) || 0);
    return score > 0 && (list.length < HS_MAX || score > list[list.length - 1].score);
  },
  /* liefert { list, rank } – rank 0 heißt: nicht in den Top 10 */
  add: function (list, entry) {
    var e = {
      name: Highscores.cleanName(entry.name), score: Math.max(0, Math.floor(Number(entry.score) || 0)),
      date: entry.date || new Date().toISOString(), seed: Number(entry.seed) || 0,
      lvl: Math.max(0, Math.floor(Number(entry.lvl) || 0)), won: !!entry.won
    };
    var all = list.slice(); all.push(e);
    var sorted = Highscores.sort(all).slice(0, HS_MAX);
    return { list: sorted, rank: sorted.indexOf(e) + 1, entry: e };
  }
};

/* ---------- Spielstand der Kampagne (im Browser gespeichert) ---------- */
var Progress = {
  KEY: PROGRESS_KEY,
  load: function (store, key) {
    var raw, o;
    try { raw = store.getItem(key || PROGRESS_KEY); o = raw ? JSON.parse(raw) : null; } catch (e) { o = null; }
    if (!o || typeof o !== 'object') return null;
    var lvl = Math.floor(Number(o.level)), sc = Number(o.score);
    if (!(lvl >= 1 && lvl <= LEVELS.length) || !isFinite(sc) || sc < 0) return null;
    return { level: lvl, score: Math.floor(sc), date: typeof o.date === 'string' ? o.date : '' };
  },
  save: function (store, key, level, score) {
    try { store.setItem(key || PROGRESS_KEY, JSON.stringify({ level: level, score: Math.max(0, Math.floor(score) || 0), date: new Date().toISOString() })); return true; } catch (e) { return false; }
  },
  clear: function (store, key) { try { store.removeItem(key || PROGRESS_KEY); return true; } catch (e) { return false; } }
};

/* ---------- Töne (werden im Browser erzeugt, keine Sounddateien) ---------- */
var SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28];   // Dur-Pentatonik: jeder Treffer klingt höher
function createSound(o) {
  o = o || {};
  var store = o.store, key = o.key || SOUND_KEY, ac = null, master = null, bus = null, drive = null, reverbIn = null, enabled = true, lastHit = -1, lastGone = -1;
  try { if (store) enabled = store.getItem(key) !== '0'; } catch (e) { }
  var vol = 100; try { var sv = store && store.getItem(key + '-vol'); if (sv !== null && sv !== undefined && isFinite(+sv)) vol = Math.max(0, Math.min(100, +sv)); } catch (e) { }   // 13.10.: Lautstärke 0–100 %
  function curve(amount) {
    var n = 257, c = new Float32Array(n);                 // ungerade Länge: Eingang 0 ergibt genau Ausgang 0 (kein Gleichspannungs-Brummen)
    for (var i = 0; i < n; i++) { var x = i * 2 / (n - 1) - 1; c[i] = (1 + amount) * x / (1 + amount * Math.abs(x)); }
    return c;
  }
  function makeImpulse(a, sec) {                              // künstlicher Raumhall: Rauschen, das weich ausklingt
    var n = Math.max(1, Math.floor(a.sampleRate * sec)), buf = a.createBuffer(2, n, a.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch), lp = 0;
      for (var i = 0; i < n; i++) { var k = i / n; lp += ((Math.random() * 2 - 1) - lp) * (0.55 - 0.45 * k); d[i] = lp * Math.pow(1 - k, 2.4); }
    }
    return buf;
  }
  function ensure() {
    if (ac) return ac;
    if (!o.AudioContext) return null;
    try {
      ac = new o.AudioContext();
      var comp = ac.createDynamicsCompressor();             // verklebt alles zu einem druckvollen Klang
      comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
      master = ac.createGain(); master.gain.value = 0.6 * vol / 100;
      master.connect(comp); comp.connect(ac.destination);
      bus = ac.createGain(); bus.gain.value = 1; bus.connect(master);
      drive = ac.createWaveShaper(); drive.curve = curve(30); drive.connect(bus);          // Verzerrung für Wucht
      if (ac.createConvolver) {                                                          // Hall (Raumklang)
        var cv = ac.createConvolver(), wet = ac.createGain(), hp = ac.createBiquadFilter();
        cv.buffer = makeImpulse(ac, 1.7); wet.gain.value = 0.55;
        hp.type = 'highpass'; hp.frequency.value = 220;
        reverbIn = ac.createGain(); reverbIn.gain.value = 1;
        reverbIn.connect(hp); hp.connect(cv); cv.connect(wet); wet.connect(master);
      }
    } catch (e) { ac = null; }
    return ac;
  }
  /* Ein Ausgang für alle Klänge: optional Stereo-Lage (pan, -1..1), Hall (rev, 0..1) und Verzerrung (crunch) */
  function out(a, node, pan, rev, crunch) {
    var last = node;
    if (pan && a.createStereoPanner) { var pn = a.createStereoPanner(); pn.pan.value = Math.max(-1, Math.min(1, pan)); last.connect(pn); last = pn; }
    last.connect(crunch ? drive : bus);
    if (rev && reverbIn) { var sg = a.createGain(); sg.gain.value = rev; last.connect(sg); sg.connect(reverbIn); }
  }
  /* Stimme: freq→slideTo, Filter (lp→lpTo), zweite leicht verstimmte Schicht (det in Cent), Anschlagzeit (atk) */
  function voice(f) {
    if (!enabled) return;
    var a = ensure(); if (!a) return;
    var t0 = a.currentTime + (f.delay || 0), dur = f.dur, vol = f.vol || 0.4, atk = f.atk || 0.006, last, g = a.createGain(), flt = null;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    if (f.lp) {
      flt = a.createBiquadFilter(); flt.type = 'lowpass';
      if (flt.Q) flt.Q.value = f.q || 2;
      flt.frequency.setValueAtTime(f.lp, t0);
      if (f.lpTo) flt.frequency.exponentialRampToValueAtTime(f.lpTo, t0 + dur);
      flt.connect(g); last = flt;
    } else last = g;
    var n = f.det ? 2 : 1;
    for (var i = 0; i < n; i++) {
      var osc = a.createOscillator();
      osc.type = f.type || 'sine';
      var fr = f.freq * (i ? Math.pow(2, f.det / 1200) : 1);
      osc.frequency.setValueAtTime(fr, t0);
      if (f.to) osc.frequency.exponentialRampToValueAtTime(f.to * (i ? Math.pow(2, f.det / 1200) : 1), t0 + dur);
      osc.connect(last); osc.start(t0); osc.stop(t0 + dur + 0.05);
    }
    out(a, g, f.pan, f.rev, f.crunch);
  }
  function tone(freq, dur, type, vol, slideTo, delay, crunch, extra) {
    var f = { freq: freq, dur: dur, type: type, vol: vol, to: slideTo, delay: delay, crunch: crunch };
    if (extra) for (var k in extra) f[k] = extra[k];
    voice(f);
  }
  function kick(freq, dur, vol, delay, pan) { voice({ freq: freq, to: 38, dur: dur, type: 'sine', vol: vol || 0.8, delay: delay, pan: pan, atk: 0.004 }); }   // Bass-Schlag
  /* Rauschen mit Filter (lowpass/bandpass/highpass), Filterfahrt, Anschwellen (up) und Hall */
  function noise(dur, vol, freq, delay, x) {
    if (!enabled) return;
    var a = ensure(); if (!a) return;
    x = x || {};
    var n = Math.max(1, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (x.up ? Math.min(1, i / n * 4) * (1 - i / n) * 1.4 : (1 - i / n));
    var src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t0 = a.currentTime + (delay || 0);
    src.buffer = buf; f.type = x.type || 'lowpass'; f.frequency.setValueAtTime(freq || 1200, t0);
    if (f.Q) f.Q.value = x.q || 0.8;
    if (x.to) f.frequency.exponentialRampToValueAtTime(x.to, t0 + dur);
    g.gain.setValueAtTime(vol || 0.3, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); out(a, g, x.pan, x.rev, false); src.start(t0);
  }
  function note(i) { return 330 * Math.pow(2, SCALE[Math.min(Math.max(i, 0), SCALE.length - 1)] / 12); }
  function panOf(x) { return x == null ? 0 : Math.max(-0.7, Math.min(0.7, (x - 360) / 360 * 0.8)); }
  function bell(freq, vol, delay, pan, rev, dur) {            // glasklarer Glockenton: Grundton + unharmonische Obertöne
    tone(freq * 2.76, (dur || 0.5) * 0.45, 'sine', vol * 0.35, 0, delay, false, { pan: pan, rev: rev });
    tone(freq * 5.4, (dur || 0.5) * 0.2, 'sine', vol * 0.14, 0, delay, false, { pan: pan, rev: rev });
    tone(freq * 2, (dur || 0.5) * 0.7, 'sine', vol * 0.3, 0, delay, false, { pan: pan, rev: rev });
  }
  var S = {
    enabled: function () { return enabled; },
    setEnabled: function (v) {
      enabled = !!v;
      try { if (store) store.setItem(key, enabled ? '1' : '0'); } catch (e) { }
      return enabled;
    },
    toggle: function () { return S.setEnabled(!enabled); },
    volume: function () { return vol; },
    setVolume: function (v) {
      vol = Math.max(0, Math.min(100, +v || 0));
      if (master) master.gain.value = 0.6 * vol / 100;
      try { if (store) store.setItem(key + '-vol', String(vol)); } catch (e) { }
    },
    resume: function () { var a = ensure(); if (a && a.state === 'suspended' && a.resume) { try { a.resume(); } catch (e) { } } },
    fire: function (volley) {
      kick(220, 0.22, 0.85);
      tone(2000, 0.34, 'sawtooth', 0.38, 130, 0, true, { lp: 7000, lpTo: 500, q: 5, det: 14, rev: 0.35 });     // Laser-Zap
      tone(3200, 0.12, 'square', 0.12, 700, 0, false, { rev: 0.2 });
      noise(0.16, 0.26, 7000, 0, { type: 'bandpass', to: 1200, q: 1.5, rev: 0.2 });
      if (volley) { tone(1300, 0.24, 'sawtooth', 0.28, 150, 0.06, true, { lp: 6000, lpTo: 450, q: 4, rev: 0.3, pan: -0.4 }); tone(900, 0.24, 'sawtooth', 0.28, 120, 0.12, true, { lp: 5000, lpTo: 400, q: 4, rev: 0.3, pan: 0.4 }); }
    },
    hit: function (e, hits) {
      var now = ac ? ac.currentTime : 0, pan = panOf(e.x), nt = note(hits || 0);
      if (e.t === 'b') {                                                  // Bonus: Glitzer-Arpeggio
        kick(180, 0.24, 0.7, 0, pan);
        for (var k = 0; k < 6; k++) { tone(note(5 + k * 2), 0.34, 'triangle', 0.36, 0, k * 0.06, false, { pan: pan, rev: 0.5 }); bell(note(5 + k * 2), 0.3, k * 0.06, pan, 0.55, 0.4); }
        return;
      }
      if (now - lastHit < 0.025) return;           // nicht mehrere Töne im selben Moment
      lastHit = now;
      var big = e.t === 'z' || e.t === 'g';
      kick(big ? 170 : 130, big ? 0.16 : 0.1, big ? 0.95 : 0.8, 0, pan);
      tone(nt, big ? 0.36 : 0.2, 'triangle', big ? 0.85 : 0.7, 0, 0, false, { pan: pan, rev: big ? 0.45 : 0.22, lp: big ? 6000 : 3500, lpTo: 900, q: 1 });
      noise(big ? 0.05 : 0.03, big ? 0.22 : 0.16, 7000, 0, { type: 'highpass', pan: pan });             // Klick beim Aufprall
      if (big) bell(nt, 0.75, 0, pan, 0.5, 0.5);
      else tone(nt * 2, 0.1, 'sine', 0.12, 0, 0, false, { pan: pan, rev: 0.2 });
    },
    gone: function (x) {
      var now = ac ? ac.currentTime : 0;
      if (now - lastGone < 0.05) return; lastGone = now;
      noise(0.12, 0.16, 4000, 0, { type: 'bandpass', to: 900, q: 1.2, pan: panOf(x), rev: 0.25 });
    },
    boom: function (x) {
      var pan = panOf(x);
      kick(140, 1.0, 1.0, 0, pan); tone(70, 1.2, 'sine', 0.7, 24, 0, false, { pan: pan });                  // Druckwelle
      noise(1.0, 0.8, 2600, 0, { to: 110, q: 0.7, pan: pan, rev: 0.6 });                                     // Feuerball
      tone(95, 0.7, 'sawtooth', 0.45, 28, 0, true, { lp: 1800, lpTo: 120, q: 1.5, pan: pan, rev: 0.4 });
      tone(320, 0.3, 'square', 0.18, 60, 0, false, { pan: pan, rev: 0.3 });
      for (var k = 0; k < 8; k++) noise(0.05, 0.22, 5500, 0.08 + Math.random() * 0.55, { type: 'highpass', pan: pan + (Math.random() - 0.5) * 0.6, rev: 0.4 });   // Knistern
      bell(520, 0.18, 0.05, pan, 0.7, 1.0);                                                                  // Metall-Nachklang
    },
    catchShip: function (x) {
      kick(110, 0.55, 0.8); tone(98, 0.9, 'sawtooth', 0.30, 82, 0, true, { lp: 900, q: 1, det: 9, rev: 0.3 }); tone(147, 0.9, 'sawtooth', 0.22, 123, 0.02, true, { lp: 1100, q: 1, rev: 0.3 });
      noise(0.12, 0.25, 2200, 0, { type: 'bandpass', q: 2 });                                                // Einrasten
      [[660, 0.08], [880, 0.22], [1320, 0.3], [1760, 0.38]].forEach(function (n) { tone(n[0], 0.5, 'sine', 0.34, 0, n[1], false, { rev: 0.6 }); bell(n[0] / 2, 0.2, n[1], 0, 0.6, 0.6); });
    },
    power: function (kind, x) {
      var pan = panOf(x);
      kick(150, 0.32, 0.7, 0, pan);
      if (kind === 'swarm') { [0, 4, 7, 12, 16].forEach(function (s, i) { tone(440 * Math.pow(2, s / 12), 0.2, 'square', 0.24, 0, i * 0.05, true, { lp: 5000, lpTo: 1500, pan: pan + (i - 2) * 0.2, rev: 0.4 }); }); noise(0.25, 0.2, 6000, 0, { type: 'highpass', rev: 0.3 }); }
      else if (kind === 'plasma') { tone(160, 0.65, 'sawtooth', 0.45, 1800, 0, true, { lp: 600, lpTo: 7000, q: 6, det: 12, pan: pan, rev: 0.4 }); tone(80, 0.6, 'sawtooth', 0.3, 420, 0, true, { lp: 500, lpTo: 2500, pan: pan }); noise(0.5, 0.26, 800, 0, { to: 8000, type: 'bandpass', q: 2, up: true, rev: 0.4 }); }
      else if (kind === 'tractor') { tone(120, 0.7, 'sine', 0.55, 440, 0, false, { pan: pan, rev: 0.4 }); tone(240, 0.7, 'sawtooth', 0.22, 880, 0, true, { lp: 700, lpTo: 3000, q: 3, det: 8, pan: pan, rev: 0.5 }); }
      else if (kind === 'volley') { [0, 7, 12, 19].forEach(function (s, i) { tone(330 * Math.pow(2, s / 12), 0.18, 'sawtooth', 0.28, 0, i * 0.07, true, { lp: 4500, lpTo: 1200, q: 2, pan: (i - 1.5) * 0.3, rev: 0.35 }); }); tone(1800, 0.25, 'square', 0.14, 400, 0.28, false, { rev: 0.3 }); }
      else if (kind === 'chain') { for (var q = 0; q < 6; q++) { tone(900 + q * 260, 0.08, 'sawtooth', 0.26, 300, q * 0.05, true, { lp: 6000, q: 4, pan: pan + (q - 3) * 0.12, rev: 0.3 }); noise(0.05, 0.22, 7000, q * 0.05, { type: 'highpass', pan: pan }); } tone(180, 0.5, 'sawtooth', 0.3, 60, 0, true, { lp: 900, rev: 0.4 }); }
      else if (kind === 'laser') { tone(3200, 0.7, 'sawtooth', 0.34, 140, 0, true, { lp: 9000, lpTo: 400, q: 6, det: 16, rev: 0.4 }); tone(70, 0.7, 'sine', 0.6, 30); noise(0.6, 0.3, 9000, 0, { type: 'bandpass', to: 800, q: 1.5, rev: 0.4 }); }
      else if (kind === 'shield') { [0, 7, 12, 19].forEach(function (st, i) { tone(392 * Math.pow(2, st / 12), 0.9, 'triangle', 0.3, 0, i * 0.08, false, { rev: 0.8, atk: 0.05, pan: pan }); }); bell(784, 0.25, 0.1, pan, 0.8, 1.0); }
      else if (kind === 'stasis') { tone(1400, 0.9, 'sine', 0.3, 300, 0, false, { rev: 0.8, det: 20, pan: pan }); noise(0.6, 0.2, 3000, 0, { type: 'bandpass', to: 400, q: 4, rev: 0.6, pan: pan }); bell(880, 0.25, 0.05, pan, 0.8, 1.0); }
      else if (kind === 'slowmo') { tone(600, 1.2, 'triangle', 0.35, 150, 0, false, { rev: 0.8, pan: pan }); tone(300, 1.2, 'sine', 0.3, 75, 0, false, { rev: 0.6 }); }
      else if (kind === 'gravity') { tone(45, 1.4, 'sine', 0.8, 25); noise(1.0, 0.35, 300, 0, { to: 2500, q: 2, up: true, rev: 0.6, pan: pan }); tone(220, 1.0, 'sawtooth', 0.2, 55, 0, true, { lp: 800, lpTo: 200, rev: 0.5 }); }
      else if (kind === 'warp') { S.warp(x); }
      else if (kind === 'double') { [0, 4, 7, 12, 16, 19].forEach(function (st, i) { tone(523 * Math.pow(2, st / 12), 0.25, 'square', 0.18, 0, i * 0.045, false, { lp: 6000, rev: 0.5, pan: pan }); }); }
      else if (kind === 'mega') { tone(55, 0.9, 'sine', 0.8, 28); tone(110, 0.8, 'sawtooth', 0.4, 300, 0, true, { lp: 500, lpTo: 2500, q: 3, det: 10, pan: pan, rev: 0.4 }); noise(0.5, 0.3, 500, 0, { to: 3000, q: 1, up: true, rev: 0.3 }); }
      else { [523, 784, 1047, 1568].forEach(function (f, i) { tone(f, 0.3, 'triangle', 0.42, 0, i * 0.11, false, { pan: pan, rev: 0.55 }); bell(f, 0.22, i * 0.11, pan, 0.55, 0.5); }); }
    },
    comboTier: function (tier) {                              // PR5: neue Combo-Stufe – Aufwärts-Wusch + Akkord, je Stufe höher und voller
      var base = 262 * Math.pow(2, (tier - 1) * 3 / 12);
      noise(0.5, 0.24, 400, 0, { to: 6000 + tier * 1500, type: 'bandpass', q: 2, up: true, rev: 0.5 });
      kick(70, 0.6, 0.9, 0.42);
      [0, 4, 7, 12, 16, 19, 24].slice(0, 3 + tier).forEach(function (s, i) {
        var f = base * Math.pow(2, s / 12);
        tone(f, 0.9, 'sawtooth', 0.16, 0, 0.42 + i * 0.03, true, { lp: 2400, lpTo: 900, det: 9, rev: 0.7, pan: (i - 2) * 0.2 });
        bell(f * 2, 0.24, 0.42 + i * 0.05, (i - 2) * 0.2, 0.8, 0.9);
      });
    },
    combo: function (n) { var i = Math.min(8, Math.floor(n / 5)); for (var k = 0; k < 3; k++) { tone(note(5 + i + k * 2), 0.4, 'triangle', 0.4, 0, k * 0.06, false, { rev: 0.6 }); bell(note(5 + i + k * 2), 0.3, k * 0.06, 0, 0.6, 0.6); } kick(150, 0.2, 0.6); },
    comboBonus: function (n) { var big = n >= 15; kick(90, 0.5, 0.9); [0, 4, 7, 12, 16].slice(0, big ? 5 : 3).forEach(function (st, i) { tone(262 * Math.pow(2, st / 12), 0.7, 'triangle', 0.4, 0, 0.08 + i * 0.07, false, { rev: 0.7, det: 6 }); bell(262 * Math.pow(2, st / 12) * 2, 0.25, 0.08 + i * 0.07, 0, 0.7, 0.8); }); noise(0.3, 0.2, 7000, 0.05, { type: 'highpass', rev: 0.4 }); },
    armor: function (x) { var pan = panOf(x); kick(95, 0.14, 0.8, 0, pan); tone(260, 0.2, 'square', 0.22, 120, 0, true, { lp: 2500, pan: pan, rev: 0.3 }); noise(0.06, 0.3, 6500, 0, { type: 'highpass', pan: pan }); bell(520, 0.35, 0, pan, 0.4, 0.5); },
    zap: function (x) { var pan = panOf(x); tone(1600, 0.1, 'sawtooth', 0.22, 400, 0, true, { lp: 7000, q: 5, pan: pan, rev: 0.3 }); noise(0.06, 0.2, 8000, 0, { type: 'highpass', pan: pan }); },
    net: function (x) { var pan = panOf(x); kick(120, 0.2, 0.7, 0, pan); tone(180, 0.4, 'sine', 0.55, 720, 0, false, { pan: pan, rev: 0.5 }); bell(660, 0.35, 0.05, pan, 0.7, 0.7); },
    warp: function (x) {
      var pan = panOf(x);
      kick(90, 0.34, 0.6, 0, pan);
      tone(160, 0.6, 'sine', 0.5, 1900, 0, false, { det: 18, pan: pan, rev: 0.6 });
      tone(2600, 0.5, 'triangle', 0.2, 280, 0.04, false, { pan: -pan, rev: 0.6 });
      noise(0.45, 0.28, 400, 0, { to: 7000, type: 'bandpass', q: 3, up: true, pan: pan, rev: 0.5 });
    },
    bump: function (x) {
      var pan = panOf(x);
      kick(105, 0.16, 0.9, 0, pan); tone(190, 0.18, 'triangle', 0.5, 90, 0, true, { pan: pan, rev: 0.25 });
      noise(0.07, 0.32, 5500, 0, { type: 'highpass', pan: pan }); bell(310, 0.28, 0, pan, 0.4, 0.5);        // metallischer Klang
    },
    intro: function () {                                       // 12.10.: kleine Melodie beim Spielstart (d-Moll, Weltraum-Fläche + Glocken)
      kick(70, 0.9, 0.5);
      [146.8, 220, 293.7].forEach(function (f, i) { tone(f, 2.6, 'sawtooth', 0.12, 0, 0, true, { lp: 400, lpTo: 2200, q: 1, det: 9, atk: 0.5, rev: 0.8, pan: (i - 1) * 0.5 }); });
      [[587, 0], [698, 0.22], [880, 0.44], [784, 0.78], [698, 1.0], [587, 1.22], [880, 1.55], [1175, 1.85]].forEach(function (n, i) {
        tone(n[0], 0.55, 'triangle', 0.3, 0, n[1], false, { rev: 0.7, atk: 0.02, pan: (i % 2 ? 0.25 : -0.25) }); bell(n[0], 0.2, n[1], (i % 2 ? 0.25 : -0.25), 0.7, 0.7);
      });
      tone(73.4, 2.4, 'sine', 0.5, 0, 1.55, false, { atk: 0.2 });
    },
    levelStart: function () {
      tone(180, 0.7, 'sawtooth', 0.28, 900, 0, true, { lp: 500, lpTo: 4000, q: 3, det: 10, rev: 0.5 }); kick(100, 0.45, 0.6);
      [0, 7, 12].forEach(function (s, i) { tone(262 * Math.pow(2, s / 12), 0.9, 'triangle', 0.24, 0, 0.35 + i * 0.07, false, { rev: 0.7, atk: 0.04 }); });
    },
    won: function () {
      kick(100, 0.55, 0.9); tone(65, 1.2, 'sawtooth', 0.32, 0, 0, true, { lp: 500, q: 1 });
      [0, 4, 7, 12, 16, 19, 24].forEach(function (s, i) {
        var f = 262 * Math.pow(2, s / 12);
        tone(f, 0.7, 'triangle', 0.5, 0, i * 0.11, false, { rev: 0.65, det: 7 });
        tone(f / 2, 0.55, 'sawtooth', 0.2, 0, i * 0.11, true, { lp: 1800, lpTo: 600, rev: 0.4 });
        bell(f, 0.22, i * 0.11, (i - 3) * 0.15, 0.65, 0.8);
      });
      [0, 4, 7, 12].forEach(function (s) { tone(262 * Math.pow(2, s / 12), 1.6, 'triangle', 0.26, 0, 0.8, false, { rev: 0.8, atk: 0.05 }); });
    },
    lost: function () {
      kick(80, 1.0, 1.0); [0, -3, -7, -12].forEach(function (s, i) { tone(330 * Math.pow(2, s / 12), 0.6, 'sawtooth', 0.3, 0, i * 0.19, true, { lp: 2400, lpTo: 300, q: 2, det: 11, rev: 0.55 }); });
      tone(55, 1.2, 'sine', 0.6, 28, 0.2); noise(0.9, 0.2, 1500, 0.3, { to: 120, rev: 0.6 });
    }
  };
  return S;
}

/* Speicher mit Notlösung (falls der Browser den Speicher sperrt) */
function safeStore(win) {
  try {
    var s = win.localStorage, k = '__omnibreaker_probe__';
    s.setItem(k, '1'); s.removeItem(k);
    return s;
  } catch (e) {
    var mem = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; }
    };
  }
}

/* ---------- Darstellung ---------- */
var COL = {
  n: { base: '#566478', hi: '#9fb2c8', glow: '#6fa8dc' },
  z: { base: '#e8741a', hi: '#ffc46b', glow: '#ff9a1f' },
  b: { base: '#8e4de0', hi: '#d2a6ff', glow: '#b46bff' }
};
var PCOL = {
  stasis:  { base: '#5a6fa8', hi: '#d6e0ff', glow: '#9fb4ff' },
  magnet:  { base: '#b23a3a', hi: '#ffc0c0', glow: '#ff6a6a' },
  double:  { base: '#c98a15', hi: '#ffe7a8', glow: '#ffc23c' },
  drill:   { base: '#7a7f8c', hi: '#eef2f8', glow: '#c9d3e2' },
  slowmo:  { base: '#2a8f8f', hi: '#bff7f7', glow: '#5ee6e6' },
  warp:    { base: '#6a3fc9', hi: '#dccbff', glow: '#a77bff' },
  gravity: { base: '#2a2440', hi: '#b9a6ff', glow: '#7d5cff' },
  split:   { base: '#c9611f', hi: '#ffd2b0', glow: '#ff9850' },
  bomb:    { base: '#c43a5a', hi: '#ff9ab0', glow: '#ff5a7a' },
  swarm:   { base: '#1fa89e', hi: '#a6fff6', glow: '#4cf0e0' },
  plasma:  { base: '#c9a415', hi: '#fff3a0', glow: '#ffe14c' },
  tractor: { base: '#3f73c9', hi: '#b8d4ff', glow: '#6aa8ff' },
  extra:   { base: '#2fb866', hi: '#9bffc4', glow: '#46e08a' },
  volley:  { base: '#c0529f', hi: '#ffc4ec', glow: '#ff8fd8' },
  chain:   { base: '#3a5fd0', hi: '#d0ddff', glow: '#7fa2ff' },
  laser:   { base: '#d0451d', hi: '#ffd0b0', glow: '#ff7a3a' },
  shield:  { base: '#2a9fc4', hi: '#c4f0ff', glow: '#5ed8ff' },
  mega:    { base: '#8a5a2a', hi: '#ffe0b0', glow: '#ffb060' }
};
function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = obT(text);
  return n;
}

/* Eigenes Logo: E im Ring (Omni) mit Laserstrahl und Gesteinsbrocken */
function makeLogo() {
  var NS = 'http://www.w3.org/2000/svg';
  function n(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var svg = n('svg', { viewBox: '0 0 44 44', width: '34', height: '34', 'aria-hidden': 'true' });
  svg.style.alignSelf = 'center'; svg.style.flex = '0 0 34px';
  svg.appendChild(n('circle', { cx: '22', cy: '23', r: '16.5', fill: 'none', stroke: '#ff9a1f', 'stroke-width': '3', 'stroke-dasharray': '82 22', 'stroke-dashoffset': '-14', 'stroke-linecap': 'round' }));
  svg.appendChild(n('path', { d: 'M16 14.5 H29 M16 23 H27 M16 31.5 H29 M16 14.5 V31.5', stroke: '#d7dde6', 'stroke-width': '3.4', 'stroke-linecap': 'square', fill: 'none' }));
  svg.appendChild(n('path', { d: 'M2 2 L15 13', stroke: '#ffd08a', 'stroke-width': '2', 'stroke-linecap': 'round' }));
  svg.appendChild(n('circle', { cx: '15.5', cy: '13.5', r: '2.2', fill: '#fff' }));
  svg.appendChild(n('polygon', { points: '36,3 41,5 40,10 35,9', fill: '#7d8ea5' }));
  svg.appendChild(n('polygon', { points: '39,13 42,14 41,17 38,16', fill: '#566478' }));
  return svg;
}

/* Symbole der Power-Items (Mittelpunkt = 0/0, r = Radius des Asteroiden) */
function drawPowerIcon(c, kind, r) {
  c.save(); c.strokeStyle = '#ffffff'; c.fillStyle = '#ffffff'; c.lineWidth = Math.max(1.4, r * 0.15); c.lineCap = 'round';
  if (kind === 'bomb') {
    for (var k = 0; k < 8; k++) { var a = k * 0.7854; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2); c.lineTo(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62); c.stroke(); }
  } else if (kind === 'swarm') {
    [[0, -0.34], [-0.34, 0.26], [0.34, 0.26]].forEach(function (d) { c.beginPath(); c.arc(d[0] * r, d[1] * r, r * 0.2, 0, 6.2832); c.fill(); });
  } else if (kind === 'plasma') {
    c.beginPath(); c.moveTo(0, -r * 0.62); c.quadraticCurveTo(r * 0.6, 0, 0, r * 0.58); c.quadraticCurveTo(-r * 0.6, 0, 0, -r * 0.62); c.fill();
  } else if (kind === 'tractor') {
    c.beginPath(); c.moveTo(0, -r * 0.55); c.lineTo(0, r * 0.45); c.stroke();
    c.beginPath(); c.moveTo(-r * 0.38, r * 0.12); c.lineTo(0, r * 0.55); c.lineTo(r * 0.38, r * 0.12); c.stroke();
  } else if (kind === 'volley') {
    [-0.36, 0, 0.36].forEach(function (d) { c.beginPath(); c.moveTo(d * r * 0.5, -r * 0.5); c.lineTo(d * r * 1.5, r * 0.55); c.stroke(); });
  } else if (kind === 'chain') {
    c.beginPath(); c.moveTo(r * 0.12, -r * 0.64); c.lineTo(-r * 0.32, r * 0.06); c.lineTo(r * 0.04, r * 0.06); c.lineTo(-r * 0.12, r * 0.64); c.lineTo(r * 0.34, -r * 0.12); c.lineTo(-r * 0.02, -r * 0.12); c.closePath(); c.fill();
  } else if (kind === 'laser') {
    c.beginPath(); c.moveTo(-r * 0.62, 0); c.lineTo(r * 0.62, 0); c.stroke();
    c.beginPath(); c.moveTo(-r * 0.42, -r * 0.22); c.lineTo(-r * 0.64, 0); c.lineTo(-r * 0.42, r * 0.22); c.moveTo(r * 0.42, -r * 0.22); c.lineTo(r * 0.64, 0); c.lineTo(r * 0.42, r * 0.22); c.stroke();
  } else if (kind === 'shield') {
    c.beginPath(); c.moveTo(-r * 0.46, -r * 0.42); c.lineTo(r * 0.46, -r * 0.42); c.lineTo(r * 0.46, r * 0.06); c.quadraticCurveTo(r * 0.4, r * 0.46, 0, r * 0.64); c.quadraticCurveTo(-r * 0.4, r * 0.46, -r * 0.46, r * 0.06); c.closePath(); c.stroke();
  } else if (kind === 'mega') {
    c.beginPath(); c.arc(0, 0, r * 0.34, 0, 6.2832); c.fill(); c.beginPath(); c.arc(0, 0, r * 0.62, 0, 6.2832); c.stroke();
  } else if (kind === 'stasis') {
    c.beginPath(); for (var h6 = 0; h6 < 6; h6++) { var a6 = h6 * 1.0472 - 0.5236; c[h6 ? 'lineTo' : 'moveTo'](Math.cos(a6) * r * 0.6, Math.sin(a6) * r * 0.6); } c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-r * 0.3, 0); c.lineTo(r * 0.3, 0); c.moveTo(0, -r * 0.3); c.lineTo(0, r * 0.3); c.stroke();
  } else if (kind === 'magnet') {
    c.beginPath(); c.arc(0, -r * 0.05, r * 0.38, Math.PI, 0, true); c.moveTo(-r * 0.38, -r * 0.05); c.lineTo(-r * 0.38, -r * 0.55); c.moveTo(r * 0.38, -r * 0.05); c.lineTo(r * 0.38, -r * 0.55); c.stroke();
  } else if (kind === 'double') {
    c.font = '700 ' + Math.round(r * 0.95) + 'px "Segoe UI",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('\u00d72', 0, r * 0.04);
  } else if (kind === 'drill') {
    c.beginPath(); c.moveTo(-r * 0.32, -r * 0.5); c.lineTo(r * 0.32, -r * 0.5); c.lineTo(0, r * 0.62); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(-r * 0.2, -r * 0.18); c.lineTo(r * 0.24, -r * 0.3); c.moveTo(-r * 0.12, r * 0.12); c.lineTo(r * 0.16, r * 0.02); c.stroke();
  } else if (kind === 'slowmo') {
    c.beginPath(); c.moveTo(-r * 0.36, -r * 0.55); c.lineTo(r * 0.36, -r * 0.55); c.lineTo(-r * 0.36, r * 0.55); c.lineTo(r * 0.36, r * 0.55); c.closePath(); c.stroke();
  } else if (kind === 'warp') {
    c.beginPath(); c.arc(0, 0, r * 0.58, 0.4, 5.2); c.stroke(); c.beginPath(); c.arc(0, 0, r * 0.3, 2.0, 6.8); c.stroke();
    c.beginPath(); c.arc(0, 0, r * 0.1, 0, 6.2832); c.fill();
  } else if (kind === 'gravity') {
    c.beginPath(); c.arc(0, 0, r * 0.26, 0, 6.2832); c.fill();
    for (var g4 = 0; g4 < 4; g4++) { var a4 = g4 * 1.5708 + 0.3; c.beginPath(); c.arc(0, 0, r * 0.56, a4, a4 + 1.0); c.stroke(); }
  } else if (kind === 'split') {
    for (var s5 = 0; s5 < 5; s5++) { var a5 = s5 * 1.2566 - 1.5708; c.beginPath(); c.moveTo(Math.cos(a5) * r * 0.12, Math.sin(a5) * r * 0.12); c.lineTo(Math.cos(a5) * r * 0.45, Math.sin(a5) * r * 0.45); c.stroke(); c.beginPath(); c.arc(Math.cos(a5) * r * 0.58, Math.sin(a5) * r * 0.58, r * 0.09, 0, 6.2832); c.fill(); }
  } else {
    c.beginPath(); c.moveTo(-r * 0.5, 0); c.lineTo(r * 0.5, 0); c.moveTo(0, -r * 0.5); c.lineTo(0, r * 0.5); c.stroke();
  }
  c.restore();
}

/* OB4 (12.10.2026): 12 selbst gezeichnete Weltraum-Szenen im EVE-Stil (keine Bilddateien, keine CCP-Grafik).
   Je Level: Szene + Farbton; Höhepunkte haben eigene Szenen. obPaintScene malt in Spielkoordinaten (W×H plus Rand m),
   liefert optional ein Dreh-Teil (spin), das beim Zeichnen langsam rotiert. */
var OB_SCENES = ['nebula', 'gasgiant', 'gate', 'belt', 'wormhole', 'sun', 'station', 'wrecks', 'planet', 'galaxy', 'pillars', 'blackhole'];
var OB_PEAK_SCENE = { 10: 'gate', 20: 'gate', 30: 'station', 40: 'blackhole', 50: 'wormhole', 60: 'station', 70: 'sun', 80: 'wormhole', 90: 'nebula', 100: 'sun' };
function obSceneOf(L) {
  if (!(L >= 1)) return { kind: 'nebula', hue: 215 };
  var hues = [210, 330, 265, 25, 160, 45, 295, 185, 95, 5, 235, 60];
  return { kind: OB_PEAK_SCENE[L] || OB_SCENES[(L - 1) % OB_SCENES.length], hue: (hues[(L * 7) % hues.length] + Math.floor((L - 1) / 12) * 23) % 360 };
}
function hsla(h, s, l, a) { return 'hsla(' + ((h % 360) + 360) % 360 + ',' + s + '%,' + l + '%,' + a + ')'; }
function obSoft(g, x, y, r, col) { var rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2); }
/* Nebel aus vielen weichen Wolken: dichter Kern, ausfransende Ränder, dunkle Staubbahnen */
function obNebula(g, rnd, cx, cy, R, h, a) {
  for (var i = 0; i < 70; i++) {
    var ang = rnd() * 6.2832, d = Math.pow(rnd(), 0.7) * R, x = cx + Math.cos(ang) * d * 1.2, y = cy + Math.sin(ang) * d * 0.8, r = 30 + rnd() * R * 0.45;
    obSoft(g, x, y, r, hsla(h + (rnd() - 0.5) * 50, 70 + rnd() * 20, 45 + rnd() * 20, a * (0.25 + rnd() * 0.5) * (1 - d / R * 0.6)));
  }
  for (i = 0; i < 18; i++) { var dx = cx + (rnd() - 0.5) * R * 1.6, dy = cy + (rnd() - 0.5) * R; obSoft(g, dx, dy, 20 + rnd() * 60, 'rgba(0,0,0,' + (0.12 + rnd() * 0.18) + ')'); }
  for (i = 0; i < 6; i++) obSoft(g, cx + (rnd() - 0.5) * R * 0.8, cy + (rnd() - 0.5) * R * 0.6, 10 + rnd() * 25, hsla(h + 20, 90, 80, a * 0.5));
}
function obStars(g, rnd, x0, y0, x1, y1, n) {
  var cols = ['#ffffff', '#cfe3ff', '#ffe8c8', '#c8d8ff', '#ffd6d0'];
  for (var i = 0; i < n; i++) { g.globalAlpha = 0.25 + rnd() * 0.6; g.fillStyle = cols[Math.floor(rnd() * cols.length)]; var s = rnd() < 0.9 ? 0.5 + rnd() * 0.7 : 1.2 + rnd() * 0.9; g.fillRect(x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), s, s); }
  g.globalAlpha = 1;
  for (i = 0; i < 9; i++) {                                         // helle Sterne mit Lichthof und Strahlenkreuz
    var x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0), c = cols[1 + Math.floor(rnd() * 4)];
    obSoft(g, x, y, 9, 'rgba(200,220,255,.35)'); g.fillStyle = c; g.fillRect(x - 1, y - 1, 2, 2);
    g.globalAlpha = 0.35; g.fillRect(x - 9, y - 0.3, 18, 0.6); g.fillRect(x - 0.3, y - 9, 0.6, 18); g.globalAlpha = 1;
  }
}
function obPlanet(g, x, y, r, h, rnd, rings) {
  if (rings) { g.save(); g.translate(x, y); g.rotate(-0.32); g.strokeStyle = hsla(h + 20, 40, 70, 0.22); for (var k = 0; k < 6; k++) { g.lineWidth = 2 + rnd() * 5; g.beginPath(); g.ellipse(0, 0, r * (1.55 + k * 0.12), r * (0.3 + k * 0.025), 0, Math.PI, 6.2832); g.stroke(); } g.restore(); }
  var pg = g.createRadialGradient(x - r * 0.45, y - r * 0.45, r * 0.1, x, y, r); pg.addColorStop(0, hsla(h, 55, 62, 1)); pg.addColorStop(0.7, hsla(h + 15, 50, 28, 1)); pg.addColorStop(1, hsla(h + 25, 45, 10, 1));
  g.fillStyle = pg; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.clip();
  for (var b = 0; b < 14; b++) { g.fillStyle = hsla(h + (rnd() - 0.5) * 40, 45, 30 + rnd() * 35, 0.18 + rnd() * 0.2); var yy = y - r + rnd() * r * 2; g.fillRect(x - r, yy, r * 2, 3 + rnd() * r * 0.14); }
  var sh = g.createLinearGradient(x - r, y - r, x + r, y + r); sh.addColorStop(0.35, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = sh; g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
  g.strokeStyle = hsla(h, 80, 75, 0.35); g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 1, 3.6, 5.6); g.stroke();   // Atmosphären-Rand
  if (rings) { g.save(); g.translate(x, y); g.rotate(-0.32); g.strokeStyle = hsla(h + 20, 40, 75, 0.3); for (var k2 = 0; k2 < 6; k2++) { g.lineWidth = 2 + rnd() * 5; g.beginPath(); g.ellipse(0, 0, r * (1.55 + k2 * 0.12), r * (0.3 + k2 * 0.025), 0, 0, Math.PI); g.stroke(); } g.restore(); }
}
function obRock(g, x, y, s, rnd, col) {
  g.fillStyle = col; g.beginPath(); var a0 = rnd() * 6;
  for (var k = 0; k < 7; k++) { var a = a0 + k * 0.8976, rr = s * (0.65 + rnd() * 0.5); g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(x - s * 0.25, y - s * 0.25, s * 0.35, 0, 6.2832); g.fill();
}
function obSpinCanvas(size, paint) { var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d'); g.translate(size / 2, size / 2); paint(g, size / 2); return c; }

function obPaintScene(g, kind, h, rnd, W, H, m, px) {
  var sp = null, i, x, y;
  var lg = g.createLinearGradient(0, -m, 0, H + m); lg.addColorStop(0, hsla(h + 10, 50, 3, 1)); lg.addColorStop(0.55, hsla(h, 45, 6, 1)); lg.addColorStop(1, hsla(h - 15, 50, 4, 1));
  g.fillStyle = lg; g.fillRect(-m, -m, W + 2 * m, H + 2 * m);
  obNebula(g, rnd, 120 + rnd() * 480, 180 + rnd() * 540, 260, h, kind === 'nebula' || kind === 'pillars' ? 0.5 : 0.28);
  obNebula(g, rnd, 120 + rnd() * 480, 180 + rnd() * 540, 200, h + 40 + rnd() * 160, 0.18);
  obStars(g, rnd, -m, -m, W + m, H + m, 900);
  if (kind === 'nebula') {
    obNebula(g, rnd, 360, 430, 330, h, 0.55); obNebula(g, rnd, 520, 260, 180, h + 60, 0.35);
    obSoft(g, 360, 430, 60, hsla(h + 30, 90, 85, 0.25));
  } else if (kind === 'gasgiant') {
    obPlanet(g, 600, 210, 130, h + 15, rnd, true);
    obPlanet(g, 150, 640, 18, h + 180, rnd, false);
  } else if (kind === 'planet') {
    obPlanet(g, 720, 980, 520, h, rnd, false);                       // großer Planet unten rechts, nur der Rand sichtbar
    obPlanet(g, 150, 230, 34, h + 140, rnd, false);
  } else if (kind === 'sun') {
    obSoft(g, 610, 140, 420, hsla(h + 30, 90, 55, 0.35)); obSoft(g, 610, 140, 200, hsla(h + 40, 100, 70, 0.5)); obSoft(g, 610, 140, 70, 'rgba(255,250,235,.95)');
    g.fillStyle = 'rgba(255,252,240,1)'; g.beginPath(); g.arc(610, 140, 30, 0, 6.2832); g.fill();
    sp = { c: obSpinCanvas(Math.round(560 * px), function (s, R) { s.scale(px, px); for (var k = 0; k < 18; k++) { s.rotate(0.349); var rg = s.createLinearGradient(0, 0, 270, 0); rg.addColorStop(0, hsla(h + 40, 100, 80, 0.25)); rg.addColorStop(1, 'rgba(0,0,0,0)'); s.fillStyle = rg; s.beginPath(); s.moveTo(30, -6); s.lineTo(270, 0); s.lineTo(30, 6); s.fill(); } }), x: 610, y: 140, w: 560, rot: 0.03 };
  } else if (kind === 'gate') {
    obSoft(g, 360, 300, 230, hsla(h + 200, 80, 55, 0.18));
    g.save(); g.translate(360, 300);
    g.strokeStyle = 'rgba(150,165,190,.35)'; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 150, 0, 6.2832); g.stroke();       // Torring
    g.strokeStyle = 'rgba(40,46,58,.9)'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 150, 0, 6.2832); g.stroke();
    for (i = 0; i < 4; i++) { g.save(); g.rotate(i * 1.5708 + 0.785); g.fillStyle = 'rgba(70,78,95,.9)'; g.fillRect(140, -14, 70, 28); g.fillStyle = hsla(h + 200, 90, 70, 0.8); g.fillRect(196, -4, 10, 8); g.restore(); }
    g.restore();
    sp = { c: obSpinCanvas(Math.round(300 * px), function (s, R) { s.scale(px, px); for (var k = 0; k < 7; k++) { s.rotate(0.9); s.strokeStyle = hsla(h + 200, 90, 70, 0.10 + k * 0.03); s.lineWidth = 3; s.beginPath(); s.arc(0, 0, 135 - k * 14, 0, 4.2); s.stroke(); } obSoft(s, 0, 0, 70, hsla(h + 200, 100, 80, 0.4)); }), x: 360, y: 300, w: 300, rot: 0.25 };
  } else if (kind === 'station') {
    g.save(); g.translate(560, 230); g.globalAlpha = 0.55;
    g.fillStyle = 'rgba(55,60,72,.95)'; g.fillRect(-170, -18, 340, 36); g.fillRect(-26, -150, 52, 300);                       // Kreuz-Rumpf
    g.fillStyle = 'rgba(80,88,104,.95)'; g.beginPath(); g.arc(0, 0, 60, 0, 6.2832); g.fill();
    g.strokeStyle = 'rgba(120,130,150,.6)'; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 105, 0, 6.2832); g.stroke();
    g.fillStyle = 'rgba(255,190,90,.9)'; for (i = 0; i < 26; i++) { g.fillRect(-160 + i * 12.5, -3, 4, 2); }                  // Fensterreihen
    for (i = 0; i < 12; i++) g.fillRect(-2, -140 + i * 24, 4, 3);
    obSoft(g, 0, 0, 40, 'rgba(255,200,120,.35)'); g.globalAlpha = 1; g.restore();
    for (i = 0; i < 18; i++) { g.fillStyle = 'rgba(255,200,110,' + (0.3 + rnd() * 0.4) + ')'; g.fillRect(300 + rnd() * 400, 60 + rnd() * 340, 2, 1); }   // Verkehr
  } else if (kind === 'belt') {
    for (i = 0; i < 140; i++) { var tt = rnd(); x = -40 + tt * 800; y = 760 - tt * 520 + (rnd() - 0.5) * 140; obRock(g, x, y, 2 + Math.pow(rnd(), 3) * 26, rnd, hsla(h + 20, 12, 18 + rnd() * 18, 0.85)); }
    obSoft(g, 380, 520, 260, hsla(h + 30, 50, 50, 0.08));
  } else if (kind === 'wrecks') {
    for (i = 0; i < 9; i++) {
      x = rnd() * W; y = 140 + rnd() * 700; var L = 30 + rnd() * 60, an = rnd() * 6;
      g.save(); g.translate(x, y); g.rotate(an); g.fillStyle = 'rgba(52,50,56,.9)'; g.fillRect(-L / 2, -L * 0.12, L, L * 0.24); g.fillRect(-L * 0.2, -L * 0.3, L * 0.18, L * 0.6);
      g.fillStyle = 'rgba(255,110,40,.7)'; g.fillRect(L * 0.3, -2, 4, 4); obSoft(g, L * 0.32, 0, 14, 'rgba(255,120,40,.35)'); g.restore();
    }
    for (i = 0; i < 60; i++) obRock(g, rnd() * W, 120 + rnd() * 760, 1 + rnd() * 4, rnd, 'rgba(90,86,90,.7)');
  } else if (kind === 'galaxy') {
    sp = { c: obSpinCanvas(Math.round(700 * px), function (s, R) {
      s.scale(px, px); obSoft(s, 0, 0, 110, hsla(h + 40, 80, 80, 0.5));
      for (var k = 0; k < 2600; k++) { var arm = k % 3, t2 = Math.pow(rnd(), 0.8) * 3.4, rr = 20 + t2 * 92, a = t2 * 1.6 + arm * 2.094 + (rnd() - 0.5) * 0.6; s.fillStyle = hsla(h + (rnd() < 0.3 ? 200 : 0), 80, 60 + rnd() * 30, 0.15 + rnd() * 0.35); s.fillRect(Math.cos(a) * rr, Math.sin(a) * rr * 0.55, 1.2, 1.2); }
    }), x: 380, y: 470, w: 700, rot: 0.012 };
  } else if (kind === 'pillars') {
    for (i = 0; i < 3; i++) { x = 160 + i * 200 + (rnd() - 0.5) * 60; for (var k = 0; k < 26; k++) { var yy = 900 - k * (18 + rnd() * 10); obSoft(g, x + (rnd() - 0.5) * 40 + k * (i - 1) * 2, yy, 30 + rnd() * 30 - k * 0.6, 'rgba(6,3,2,' + (0.55 + rnd() * 0.3) + ')'); obSoft(g, x - 8 + (rnd() - 0.5) * 30, 900 - k * 22, 14, hsla(h + 30, 90, 70, 0.08)); } obSoft(g, x, 900 - 26 * 22, 50, hsla(h + 30, 90, 75, 0.45)); }
  } else if (kind === 'wormhole' || kind === 'blackhole') {
    var bh = kind === 'blackhole', cx = 360, cy = 430;
    obSoft(g, cx, cy, 330, hsla(h + (bh ? 20 : 190), 80, 50, 0.22));
    sp = { c: obSpinCanvas(Math.round(560 * px), function (s, R) {
      s.scale(px, px);
      for (var k = 0; k < 1400; k++) { var a = rnd() * 6.2832, rr = 70 + Math.pow(rnd(), 1.8) * 200, sw = a + rr * 0.02; s.fillStyle = hsla(h + (bh ? 30 : 190) + rr * 0.2, 90, 55 + rnd() * 30, 0.08 + rnd() * 0.25); s.fillRect(Math.cos(sw) * rr, Math.sin(sw) * rr * (bh ? 0.35 : 1), 2, 2); }
    }), x: cx, y: cy, w: 560, rot: bh ? 0.18 : 0.1 };
    var hg = g.createRadialGradient(cx, cy, 30, cx, cy, 90); hg.addColorStop(0, bh ? 'rgba(0,0,0,1)' : hsla(h + 190, 90, 85, 0.9)); hg.addColorStop(0.7, bh ? 'rgba(0,0,0,.95)' : hsla(h + 190, 80, 40, 0.5)); hg.addColorStop(1, 'rgba(0,0,0,0)');
    sp.over = function (c) { c.fillStyle = hg; c.beginPath(); c.arc(cx, cy, 90, 0, 6.2832); c.fill(); if (bh) { c.strokeStyle = hsla(h + 35, 100, 75, 0.7); c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 46, 0, 6.2832); c.stroke(); } };
  }
  return sp;
}

function mount(container, opts) {
  opts = opts || {};
  var win = container.ownerDocument.defaultView || window;
  var store = opts.storage || safeStore(win);
  var hsKey = opts.storageKey || HS_KEY, nameKey = opts.nameKey || NAME_KEY, progKey = opts.progressKey || PROGRESS_KEY;
  var defaultName = opts.defaultName || 'Pilot';
  var W = CFG.W, H = CFG.H;
  var game = new Game({ seed: opts.seed, level: opts.level == null ? 1 : opts.level });

  /* --- Aufbau --- */
  var rootEl = el('div', 'ob-root'); rootEl.tabIndex = 0;
  rootEl.setAttribute('aria-label', obT('OmniBreaker – Minispiel'));
  var main = el('div', 'ob-main'), side = el('div', 'ob-side');
  var title = el('div', 'ob-title'); title.appendChild(makeLogo()); title.appendChild(el('b', null, 'OMNIBREAKER')); title.appendChild(el('span', null, tt('Mining-Laser · ' + LEVELS.length + ' Level · Power-Items', 'Mining laser · ' + LEVELS.length + ' levels · power-ups')));
  var hud = el('div', 'ob-hud'), statEls = {};
  obF = true;   // Spielfeld: Anzeigen oben immer Englisch
  [['score', 'Punkte'], ['balls', 'Drohnen'], ['targets', 'Erzadern'], ['mult', 'Faktor'], ['level', 'Level'], ['combo', 'Combo']].forEach(function (d) {
    var s = el('div', 'ob-stat ob-s-' + d[0]); var sm = el('small', null, d[1]); s.appendChild(sm); var b = el('b', null, '–'); b.__lbl = sm; s.appendChild(b); hud.appendChild(s); statEls[d[0]] = b;
  });
  obF = false;
  var stage = el('div', 'ob-stage'), canvas = el('canvas'), msg = el('div', 'ob-msg');
  stage.appendChild(canvas); stage.appendChild(msg);
  var bar = el('div', 'ob-bar');
  var btnNew = el('button', 'ob-btn ob-primary', 'Neue Kampagne'), btnRestart = el('button', 'ob-btn', 'Level neu starten'), btnPause = el('button', 'ob-btn', 'Pause');
  var btnSound = el('button', 'ob-btn', ''), btnContinue = el('button', 'ob-btn ob-primary', 'Weiterspielen');
  // OB5: Übung als Level-Raster 1–100 (Höhepunkte orange, geschaffte grün, Bestwert im Tooltip)
  var lvBox = el('div', 'ob-lv'), lvGrid = el('div', 'ob-lvgrid'), lvCells = [];
  lvBox.appendChild(el('div', 'ob-lv-h', 'Übung: Level wählen (zählt nicht für den Highscore)')); lvBox.appendChild(lvGrid);
  LEVELS.concat([null]).forEach(function (l, i) {
    var b = el('button', 'ob-lv-c' + (l && l.peak ? ' ob-lv-peak' : ''), l ? String(i + 1) : 'Zufall'); b.type = 'button'; b.dataset.lv = l ? String(i + 1) : '0';
    lvGrid.appendChild(b); lvCells.push(b);
  });
  btnNew.type = btnRestart.type = btnPause.type = btnSound.type = btnContinue.type = 'button';
  var hint = el('div', 'ob-hint', 'Zielen: Maus bewegen · Schießen: Klick · Handy: ziehen und loslassen · Tastatur: ← → Leertaste · P Pause · M Ton');
  // PQ6: Hintergrund-Regler – 0 % = nur Brocken, Drohne und Frachter, EVE dahinter sichtbar (im Overlay-Fenster)
  var bgA = (function () { var v = Number(store.getItem ? store.getItem(BGA_KEY) : NaN); return isFinite(v) && v >= 0 && v <= 100 && store.getItem(BGA_KEY) !== null ? v : 100; })();
  var bgBox = el('label', 'ob-bga'), bgIn = el('input'), bgV = el('em', null, bgA + ' %');
  bgIn.type = 'range'; bgIn.min = '0'; bgIn.max = '100'; bgIn.step = '5'; bgIn.value = String(bgA);
  bgBox.appendChild(el('span', null, 'Hintergrund')); bgBox.appendChild(bgIn); bgBox.appendChild(bgV);
  bgApply();
  function bgApply() { var de = container.ownerDocument && container.ownerDocument.documentElement; if (de) de.classList.toggle('ob-see', bgA < 100); rootEl.classList.toggle('ob-see', bgA < 100); }
  // 13.10.: Lautstärke-Regler neben „Ton“ (sound entsteht weiter unten, wird erst beim Ziehen gebraucht)
  var volKey = (opts.soundKey || SOUND_KEY) + '-vol', volA = (function () { var v = store.getItem ? store.getItem(volKey) : null; return v !== null && isFinite(+v) ? Math.max(0, Math.min(100, +v)) : 100; })();
  var volBox = el('label', 'ob-bga'), volIn = el('input'), volV = el('em', null, volA + ' %');
  volIn.type = 'range'; volIn.min = '0'; volIn.max = '100'; volIn.step = '5'; volIn.value = String(volA);
  volBox.appendChild(el('span', null, 'Lautstärke')); volBox.appendChild(volIn); volBox.appendChild(volV);
  volIn.addEventListener('input', function () { volV.textContent = volIn.value + ' %'; sound.setVolume(volIn.value); });
  volIn.addEventListener('change', function () { sound.resume(); if (sound.enabled()) sound.hit({ t: 'z' }, 3); });
  bgIn.addEventListener('input', function () { bgA = Number(bgIn.value); bgV.textContent = bgA + ' %'; try { store.setItem(BGA_KEY, String(bgA)); } catch (e) {} bgApply(); });
  bar.appendChild(btnContinue); bar.appendChild(btnNew); bar.appendChild(btnRestart); bar.appendChild(lvBox); bar.appendChild(btnPause); bar.appendChild(btnSound); bar.appendChild(volBox); bar.appendChild(bgBox); bar.appendChild(hint);
  main.appendChild(title); main.appendChild(hud); main.appendChild(stage); main.appendChild(bar);

  side.appendChild(el('h3', null, 'Highscore · Top 10'));
  var scoreList = el('ol', 'ob-scores'); side.appendChild(scoreList);
  var btnClear = el('button', 'ob-btn', 'Highscore leeren'); btnClear.type = 'button';
  side.appendChild(btnClear);
  // PQ7: weltweite Bestenliste – lädt erst auf Klick, hochgeladen wird nur mit Haken (Haken standardmäßig gesetzt)
  var online = opts.online || null, wwOn = false, wwSel = null, wwList = null, wwSt = null;
  if (online) {
    try { wwOn = store.getItem(ONLINE_KEY) !== '0'; } catch (e) { }   // 13.10.: Standard an
    side.appendChild(el('h3', null, 'Weltweite Bestenliste')).style.marginTop = '14px';
    var wwLbl = el('label', 'ob-ww-on'), wwChk = el('input'); wwChk.type = 'checkbox'; wwChk.checked = wwOn;
    wwLbl.appendChild(wwChk); wwLbl.appendChild(el('span', null, 'Punkte hochladen')); side.appendChild(wwLbl);
    var wwWho = el('p', 'ob-ww-who'); side.appendChild(wwWho);
    var wwRow = el('div', 'ob-ww-row'); wwSel = el('select'); wwSel.appendChild(el('option', null, 'Kampagne')).value = '0';
    for (var wl = 1; wl <= LEVELS.length; wl++) wwSel.appendChild(el('option', null, 'Level ' + wl)).value = String(wl);
    var wwBtn = el('button', 'ob-btn', 'Anzeigen'); wwBtn.type = 'button';
    wwRow.appendChild(wwSel); wwRow.appendChild(wwBtn); side.appendChild(wwRow);
    wwSt = el('p', 'ob-ww-st'); side.appendChild(wwSt);
    wwList = el('ol', 'ob-scores'); side.appendChild(wwList);
    var wwWhoTxt = function () { var me = online.me(); wwWho.textContent = me ? tt('Name: ', 'Name: ') + me.n : obT('Kein EVE-Charakter eingeloggt – Hochladen geht erst nach dem Login.'); };
    wwWhoTxt();
    wwChk.addEventListener('change', function () { wwOn = wwChk.checked; try { store.setItem(ONLINE_KEY, wwOn ? '1' : '0'); } catch (e) { } wwWhoTxt(); });
    wwBtn.addEventListener('click', function () { wwShow(Number(wwSel.value)); });
  }
  function wwShow(l) {
    if (!online) return;
    wwSt.textContent = obT('Lade …'); wwList.textContent = '';
    online.top(l).then(function (list) {
      wwSt.textContent = list.length ? '' : obT('Noch keine Einträge.');
      list.slice(0, 20).forEach(function (s, i) {
        var li = el('li'); li.appendChild(el('span', 'ob-rk', String(i + 1))); var nm = el('span', 'ob-nm'); nm.textContent = s.n; li.appendChild(nm);
        li.appendChild(el('span', 'ob-sc', fmtScore(s.s))); if (l === 0 && s.lv) li.appendChild(el('span', 'ob-dt', 'Level ' + s.lv + '/' + LEVELS.length));
        wwList.appendChild(li);
      });
    }, function () { wwSt.textContent = obT('Bestenliste gerade nicht erreichbar.'); });
  }
  function wwSend(e) {
    if (!online || !wwOn) return;
    var me = online.me(); if (!me) return;
    e.cid = me.cid; e.n = me.n;
    online.send(e).then(function (r) { if (r && r.rank && wwSt) wwSt.textContent = tt('Weltweit: Platz ', 'Worldwide: rank ') + r.rank + (e.l ? ' · Level ' + e.l : tt(' · Kampagne', ' · campaign')); }, function () { });
  }
  var hLegend = el('h3', null, 'Erze & Hindernisse'); hLegend.style.marginTop = '14px'; side.appendChild(hLegend);
  var legend = el('ul', 'ob-legend'); side.appendChild(legend);
  var hPow = el('h3', null, 'Power-Items'); side.appendChild(hPow);
  var legendP = el('ul', 'ob-legend'); side.appendChild(legendP);
  side.appendChild(el('h3', null, 'Regeln'));
  side.appendChild(el('p', 'ob-rules', OB_EN ? 'Campaign: ' + LEVELS.length + ' levels, the points add up. You get 10 drones per level. Clear all ore veins (orange) = level done. Every 6 hits with one drone raise the factor by 1 (up to x8). The first drone that lands in the freighter gives you a drone and 250 points. After a win every drone left is worth 1,000 points. Power-ups act on the drone that hits them; new ones join in higher levels. Wrecks cannot be destroyed, warp gates send the drone to the partner gate. Armored rocks need several hits. Gravity fields pull the drone in, repulsors push it away. Combo: from 5 hits with one drone you get a combo bonus at the end of the shot (10 hits = 600, 20 = 3,200, 30 = 7,800 points). Your progress is saved after every level so you can continue later.' : 'Kampagne: ' + LEVELS.length + ' Level, die Punkte zählen zusammen. Pro Level hast du 10 Drohnen. Alle Erzadern (orange) leeren = Level geschafft. Alle 6 Treffer mit einer Drohne steigt der Faktor um 1 (höchstens x8). Die erste Drohne, die im Frachter landet, gibt eine Drohne und 250 Punkte. Nach dem Sieg zählt jede übrige Drohne 1.000 Punkte. Power-Items wirken auf die Drohne, die sie trifft. Wracks sind nicht zerstörbar, Warp-Tore bringen die Drohne ans Partner-Tor. Panzer-Brocken brauchen mehrere Treffer. Gravitationsfelder ziehen die Drohne an, Abstoßer stoßen sie weg. Combo: ab 5 Treffern mit einer Drohne gibt es am Schussende einen Combo-Bonus (10 Treffer = 600, 20 = 3.200, 30 = 7.800 Punkte). Dein Stand wird nach jedem Level gespeichert, du kannst später weiterspielen.'));
  rootEl.appendChild(main); rootEl.appendChild(side);
  container.appendChild(rootEl);

  var ctx = canvas.getContext('2d');
  var scale = 1, dpr = 1, bg = null, bgLevel = -1, paused = false, destroyed = false, raf = 0, last = 0;
  var texts = [], parts = [], rings = [], bolts = [], hbeams = [], newRank = 0, entered = false, flash = 0, laserT = 0, catchT = 0, beamPts = null, bannerT = 0, bumpT = {};
  var shake = 0, shakeA = 0, flashC = '255,200,120', calm = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);   // PR5: Wackeln (nicht bei „weniger Bewegung“)
  var sound = createSound({ AudioContext: opts.AudioContext || win.AudioContext || win.webkitAudioContext, store: store, key: opts.soundKey || SOUND_KEY });
  var stars = [], srnd = mulberry32(7);
  for (var si = 0; si < 170; si++) stars.push({ x: srnd() * W, y: srnd() * H, r: 0.4 + srnd() * 1.3, ph: 0.5 + srnd() * 2.5, c: ['#cfe3ff', '#ffe8c8', '#c8d8ff', '#ffd0d0'][Math.floor(srnd() * 4)], big: si % 17 === 0 });

  /* --- Zeichnen: einzelne Teile (mit frei wählbarer Zeichenfläche, damit die Legende sie auch nutzen kann) --- */
  function hash(id, i) { var x = Math.sin(id * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); }
  function rockPath(c, p, k) {                                    // weiche, unregelmäßige Felsform
    var n = 8, pts = [], i;
    for (i = 0; i < n; i++) { var a = i / n * 6.2832, rr = p.r * p.shape[i] * k; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    c.beginPath();
    var m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2]; c.moveTo(m0[0], m0[1]);
    for (i = 0; i < n; i++) { var q = pts[i], nx = pts[(i + 1) % n]; c.quadraticCurveTo(q[0], q[1], (q[0] + nx[0]) / 2, (q[1] + nx[1]) / 2); }
    c.closePath();
  }
  function drawWreckOn(c, p, t) {
    var r = p.r, fl = bumpT[p.id] > 0, i;
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
    if (fl) { c.shadowColor = '#ffd9a0'; c.shadowBlur = 22; }
    c.beginPath();
    for (var k = 0; k < 8; k++) { var a = k / 8 * 6.2832, rr = r * p.shape[k]; if (k === 0) c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    c.closePath();
    var g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#6d7886'); g.addColorStop(0.5, '#3a424d'); g.addColorStop(1, '#141820');
    c.fillStyle = g; c.fill(); c.shadowBlur = 0;
    c.save(); c.clip();                                            // Panzerplatten, Nähte, Schäden
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(-r, -r * 0.2); c.lineTo(r, r * 0.1); c.moveTo(-r * 0.15, -r); c.lineTo(r * 0.05, r); c.moveTo(-r, r * 0.45); c.lineTo(r, r * 0.55); c.stroke();
    c.strokeStyle = 'rgba(190,210,235,.22)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-r, -r * 0.2 + 1.5); c.lineTo(r, r * 0.1 + 1.5); c.moveTo(-r * 0.15 + 1.5, -r); c.lineTo(r * 0.05 + 1.5, r); c.stroke();
    c.fillStyle = 'rgba(190,100,35,.55)'; c.fillRect(r * 0.05, -r * 0.62, r * 0.42, r * 0.22);            // Rost / Brandfleck
    c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.arc(-r * 0.35, r * 0.3, r * 0.22, 0, 6.2832); c.fill();
    c.fillStyle = 'rgba(255,150,60,.25)'; c.beginPath(); c.arc(-r * 0.35, r * 0.3, r * 0.1, 0, 6.2832); c.fill();
    for (i = 0; i < 4; i++) { c.fillStyle = 'rgba(210,225,245,.5)'; c.beginPath(); c.arc(-r * 0.7 + i * r * 0.45, -r * 0.62 + (i % 2) * 2, 1.1, 0, 6.2832); c.fill(); }   // Nieten
    c.restore();
    c.lineWidth = fl ? 3 : 1.6; c.strokeStyle = fl ? '#ffffff' : '#8a97a6'; c.beginPath();
    for (k = 0; k < 8; k++) { var a2 = k / 8 * 6.2832, r2 = r * p.shape[k]; if (k === 0) c.moveTo(Math.cos(a2) * r2, Math.sin(a2) * r2); else c.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2); }
    c.closePath(); c.stroke();
    var on = (Math.floor((t || 0) * 1.5 + p.id) % 2 === 0);
    c.fillStyle = on ? '#ff5a4d' : '#4a1f1c'; if (on) { c.shadowColor = '#ff3a2a'; c.shadowBlur = 10; }
    c.beginPath(); c.arc(r * 0.55, -r * 0.35, 2.4, 0, 6.2832); c.fill();
    c.restore();
  }
  /* Rollbahn-Stein: abgerundete Platte mit heller Kante; blau/orange/grün/violett, leuchtet getroffen, gedimmt wenn verbraucht */
  var STONE_COL = { n: { base: '#2a5fae', hi: '#a9d0ff', glow: '#4ca0ff' } };
  function drawStoneOn(c, p, t) {
    var col = p.t === 'g' ? PCOL[p.power || 'bomb'] : STONE_COL[p.t] || COL[p.t], hl = (p.dl || 20) / 2, r = p.r, on = p.lit && !p.used;
    c.save(); c.translate(p.x, p.y); c.rotate(p.a || 0);
    if (p.used) c.globalAlpha = 0.22;                                // abgebaut: nur noch als Schatten, durchlässig
    function plate(e) { var x = -hl - r + e, y = -r + e, w = 2 * (hl + r - e), hh = 2 * (r - e), rr = r - e; c.beginPath(); c.moveTo(x + rr, y); c.lineTo(x + w - rr, y); c.arcTo(x + w, y, x + w, y + rr, rr); c.arcTo(x + w, y + hh, x + w - rr, y + hh, rr); c.lineTo(x + rr, y + hh); c.arcTo(x, y + hh, x, y + hh - rr, rr); c.arcTo(x, y, x + rr, y, rr); c.closePath(); }
    var gr = c.createLinearGradient(0, -r, 0, r);
    if (on) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, col.hi); gr.addColorStop(1, col.glow); c.shadowColor = col.glow; c.shadowBlur = 18; }
    else if (p.used) { gr.addColorStop(0, '#5a6576'); gr.addColorStop(1, '#232a35'); }
    else { gr.addColorStop(0, col.hi); gr.addColorStop(0.4, col.base); gr.addColorStop(1, '#0a0e15'); if (p.t !== 'n') { c.shadowColor = col.glow; c.shadowBlur = 6 + 4 * Math.sin((t || 0) * 3 + (p.id || 0)); } }
    plate(0); c.fillStyle = gr; c.fill(); c.shadowBlur = 0;
    c.lineWidth = 1; c.strokeStyle = on ? 'rgba(255,255,255,.9)' : p.used ? 'rgba(150,165,185,.5)' : col.hi; plate(0.5); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,' + (on ? 0.9 : 0.35) + ')'; c.beginPath(); c.moveTo(-hl, -r + 2.2); c.lineTo(hl, -r + 2.2); c.stroke();   // Glanzkante
    if (p.t === 'g' && !p.used) { c.save(); c.rotate(-(p.a || 0)); c.scale(0.6, 0.6); drawPowerIcon(c, p.power || 'bomb', 10); c.restore(); }
    c.restore();
  }
  function drawPegOn(c, p, t) {
    if (p.st) { drawStoneOn(c, p, t); return; }
    if (p.t === 'w') { drawWreckOn(c, p, t); return; }
    var col = p.t === 'g' ? PCOL[p.power || 'bomb'] : COL[p.t], r = p.r, id = p.id || 0, i, pulse = 0.5 + 0.5 * Math.sin((t || 0) * 3 + id);
    if (p.t === 'g') {                                              // Power-Item: leuchtende Energiekugel
      c.save(); c.translate(p.x, p.y);
      var hg = c.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.1); hg.addColorStop(0, col.glow); hg.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = 0.28 + 0.14 * pulse; c.fillStyle = hg; c.beginPath(); c.arc(0, 0, r * 2.1, 0, 6.2832); c.fill(); c.globalAlpha = 1;
      var sg = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
      if (p.lit) { sg.addColorStop(0, '#fff'); sg.addColorStop(1, col.glow); } else { sg.addColorStop(0, col.hi); sg.addColorStop(0.55, col.base); sg.addColorStop(1, '#10141c'); }
      c.shadowColor = col.glow; c.shadowBlur = p.lit ? 24 : 14; c.fillStyle = sg; c.beginPath(); c.arc(0, 0, r * 1.08, 0, 6.2832); c.fill(); c.shadowBlur = 0;
      c.strokeStyle = col.hi; c.lineWidth = 1.5; c.globalAlpha = 0.9; c.rotate((t || 0) * 1.4);
      for (i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, r * 1.22, i * 2.0944, i * 2.0944 + 1.0); c.stroke(); }
      c.rotate(-(t || 0) * 1.4); c.globalAlpha = 0.55; c.fillStyle = '#fff';                          // Glasglanz
      c.beginPath(); c.ellipse(-r * 0.32, -r * 0.44, r * 0.34, r * 0.17, -0.6, 0, 6.2832); c.fill();
      c.restore();
      c.save(); c.translate(p.x, p.y); drawPowerIcon(c, p.power || 'bomb', r); c.restore();
      return;
    }
    c.save(); c.translate(p.x, p.y);
    if (p.t !== 'n' && !p.lit) {                                   // Erz-Leuchten (pulsiert)
      var og = c.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 2.0); og.addColorStop(0, col.glow); og.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = 0.16 + 0.12 * pulse; c.fillStyle = og; c.beginPath(); c.arc(0, 0, r * 2.0, 0, 6.2832); c.fill(); c.globalAlpha = 1;
    }
    c.rotate(p.rot);
    rockPath(c, p, 1.08);
    var gr = c.createRadialGradient(-r * 0.4, -r * 0.45, r * 0.1, 0, 0, r * 1.35);
    if (p.lit) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, col.hi); gr.addColorStop(1, col.glow); c.shadowColor = col.glow; c.shadowBlur = 26; }
    else { gr.addColorStop(0, col.hi); gr.addColorStop(0.45, col.base); gr.addColorStop(1, '#0c0f14'); if (p.t !== 'n') { c.shadowColor = col.glow; c.shadowBlur = 10; } }
    c.fillStyle = gr; c.fill(); c.shadowBlur = 0;
    if (!p.lit) {
      c.save(); rockPath(c, p, 1.08); c.clip();
      for (i = 0; i < 3; i++) {                                    // Krater mit Lichtkante
        var cx = (hash(id, i) - 0.5) * r * 1.0, cy = (hash(id, i + 9) - 0.5) * r * 1.0, cr = r * (0.16 + hash(id, i + 4) * 0.14);
        c.fillStyle = 'rgba(0,0,0,.30)'; c.beginPath(); c.arc(cx, cy, cr, 0, 6.2832); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, cr, 3.6, 5.5); c.stroke();
      }
      if (p.t === 'z' || p.t === 'b') {                            // Erzkristalle
        for (i = 0; i < 3; i++) {
          var kx = (hash(id, i + 20) - 0.5) * r * 1.1, ky = (hash(id, i + 30) - 0.5) * r * 1.1, ks = r * (0.20 + hash(id, i + 40) * 0.12);
          c.save(); c.translate(kx, ky); c.rotate(hash(id, i + 50) * 3);
          c.fillStyle = col.glow; c.shadowColor = col.glow; c.shadowBlur = 8;
          c.beginPath(); c.moveTo(0, -ks * 1.4); c.lineTo(ks * 0.7, 0); c.lineTo(0, ks * 1.4); c.lineTo(-ks * 0.7, 0); c.closePath(); c.fill(); c.shadowBlur = 0;
          c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(0, -ks * 1.4); c.lineTo(ks * 0.7, 0); c.lineTo(0, -ks * 0.1); c.closePath(); c.fill();
          c.restore();
        }
      } else {
        c.fillStyle = 'rgba(255,255,255,.18)';
        for (i = 0; i < 5; i++) { c.fillRect((hash(id, i + 60) - 0.5) * r * 1.5, (hash(id, i + 70) - 0.5) * r * 1.5, 1.4, 1.4); }
      }
      c.restore();
    }
    rockPath(c, p, 1.08); c.lineWidth = 1; c.strokeStyle = p.lit ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.5)'; c.stroke();
    if (p.hp > 1 && !p.lit) {                                       // Panzerung: Metallring, Nieten, ein Ring mehr bei drei Treffern
      var ag = c.createLinearGradient(-r, -r, r, r); ag.addColorStop(0, '#f2f7ff'); ag.addColorStop(0.5, '#8d9db4'); ag.addColorStop(1, '#3b4658');
      c.strokeStyle = ag; c.lineWidth = 2.6; c.beginPath(); c.arc(0, 0, r * 1.2, 0, 6.2832); c.stroke();
      if (p.hp > 2) { c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, r * 0.92, 0, 6.2832); c.stroke(); }
      c.fillStyle = '#e4ecf8'; for (i = 0; i < 4 + (p.hp - 2) * 2; i++) { var ra = i / (4 + (p.hp - 2) * 2) * 6.2832; c.beginPath(); c.arc(Math.cos(ra) * r * 1.2, Math.sin(ra) * r * 1.2, 1.5, 0, 6.2832); c.fill(); }
    }
    c.restore();
  }
  /* PQ4: Rampe = Panzerplatte mit Leuchtkante, Bahn = Doppelschiene mit laufenden Pfeilen (EVE-Beschleunigungstor-Look) */
  function drawRampOn(c, r) {
    c.save(); c.lineCap = 'round';
    c.strokeStyle = 'rgba(20,28,40,.95)'; c.lineWidth = CFG.railHalf * 2 + 4; c.beginPath(); c.moveTo(r.x1, r.y1); c.lineTo(r.x2, r.y2); c.stroke();
    var g = c.createLinearGradient(r.x1, r.y1, r.x2, r.y2); g.addColorStop(0, '#5d6c80'); g.addColorStop(0.5, '#9aa9bc'); g.addColorStop(1, '#5d6c80');
    c.strokeStyle = g; c.lineWidth = CFG.railHalf * 2; c.beginPath(); c.moveTo(r.x1, r.y1); c.lineTo(r.x2, r.y2); c.stroke();
    c.strokeStyle = '#9fe0ff'; c.shadowColor = '#4cc3ff'; c.shadowBlur = 10; c.lineWidth = 1.2; c.beginPath(); c.moveTo(r.x1, r.y1); c.lineTo(r.x2, r.y2); c.stroke();
    c.shadowBlur = 0; c.fillStyle = '#ffb347'; [[r.x1, r.y1], [r.x2, r.y2]].forEach(function (p) { c.beginPath(); c.arc(p[0], p[1], 2.4, 0, 6.2832); c.fill(); });
    c.restore();
  }
  function drawTrackOn(c, tr, t) {
    var P = tr.pts, i, o = {};
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    function path(off) { c.beginPath(); for (var k = 0; k < P.length; k++) { var a = P[Math.max(0, k - 1)], b = P[Math.min(P.length - 1, k + 1)], l = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / l, ny = (b.x - a.x) / l; if (k) c.lineTo(P[k].x + nx * off, P[k].y + ny * off); else c.moveTo(P[k].x + nx * off, P[k].y + ny * off); } c.stroke(); }
    c.strokeStyle = 'rgba(10,20,34,.85)'; c.lineWidth = 14; path(0);
    c.strokeStyle = '#4cc3ff'; c.shadowColor = '#4cc3ff'; c.shadowBlur = 8; c.lineWidth = 1.8; path(-5); path(5); c.shadowBlur = 0;
    for (i = 0; i < 7; i++) {                                        // laufende Pfeile zeigen die Bahn an
      var s = ((i / 7 + t * 0.35) % 1) * tr.total; railAt(tr, s, o);
      c.save(); c.translate(o.x, o.y); c.rotate(Math.atan2(o.ty, o.tx)); c.globalAlpha = 0.35 + 0.5 * Math.sin(Math.PI * s / tr.total);
      c.strokeStyle = '#e8f6ff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-3, -4); c.lineTo(2, 0); c.lineTo(-3, 4); c.stroke(); c.restore();
    }
    c.fillStyle = '#ffb347'; c.shadowColor = '#ffb347'; c.shadowBlur = 8;
    [P[0], P[P.length - 1]].forEach(function (p) { c.beginPath(); for (var k = 0; k < 6; k++) { var a = k * 1.0472; if (k) c.lineTo(p.x + Math.cos(a) * 5, p.y + Math.sin(a) * 5); else c.moveTo(p.x + 5, p.y); } c.closePath(); c.fill(); });
    c.restore();
  }
  function drawGateOn(c, g, t, idx) {
    var hue = (Math.floor(idx / 2) % 2) ? '#b46bff' : '#4cc3ff', i;
    c.save(); c.translate(g.x, g.y);
    var out = c.createRadialGradient(0, 0, g.r * 0.6, 0, 0, g.r * 2.2); out.addColorStop(0, hue); out.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.28; c.fillStyle = out; c.beginPath(); c.arc(0, 0, g.r * 2.2, 0, 6.2832); c.fill(); c.globalAlpha = 1;
    var rg = c.createRadialGradient(0, 0, 1, 0, 0, g.r); rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(0.3, hue); rg.addColorStop(1, 'rgba(10,6,30,.9)');
    c.globalAlpha = 0.8; c.fillStyle = rg; c.beginPath(); c.arc(0, 0, g.r, 0, 6.2832); c.fill(); c.globalAlpha = 1;
    c.save(); c.rotate(t * 2.2 * (idx % 2 ? -1 : 1)); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.4;   // Wirbel im Inneren
    for (i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, g.r * 0.55, i * 2.0944, i * 2.0944 + 1.2); c.stroke(); }
    c.restore();
    c.rotate(t * 0.9 * (idx % 2 ? -1 : 1)); c.strokeStyle = hue; c.lineWidth = 3.5; c.shadowColor = hue; c.shadowBlur = 14;
    for (i = 0; i < 6; i++) { c.beginPath(); c.arc(0, 0, g.r - 1, i * 1.0472, i * 1.0472 + 0.66); c.stroke(); }
    c.shadowBlur = 0; c.fillStyle = '#e8f3ff';
    for (i = 0; i < 6; i++) { c.beginPath(); c.arc(Math.cos(i * 1.0472 + 0.8) * (g.r + 3), Math.sin(i * 1.0472 + 0.8) * (g.r + 3), 1.6, 0, 6.2832); c.fill(); }
    c.restore();
  }

  /* --- Legende mit kleinen Bildern --- */
  function legendRow(list, draw, text) {
    var li = el('li'), cv = el('canvas', 'ob-ico'); cv.width = 52; cv.height = 52;
    var c = cv.getContext('2d'); c.scale(2, 2); c.translate(13, 13); draw(c);
    li.appendChild(cv); li.appendChild(el('span', null, text)); list.appendChild(li);
  }
  function fakePeg(t, extra) {
    var p = { id: 0, x: 0, y: 0, r: 10, t: t, lit: false, gone: false, rot: 0.4, shape: [1, 1, 1, 1, 1, 1, 1, 1] };
    for (var k in extra) p[k] = extra[k];
    return p;
  }
  legendRow(legend, function (c) { drawPegOn(c, fakePeg('z'), 0); }, 'Erzader (orange): alle leeren = Level geschafft · 100');
  legendRow(legend, function (c) { drawPegOn(c, fakePeg('n'), 0); }, 'Gestein (grau) · 10');
  legendRow(legend, function (c) { drawPegOn(c, fakePeg('b'), 0); }, 'Mercoxit (lila): Bonus · 500');
  legendRow(legend, function (c) { drawPegOn(c, fakePeg('w', { r: 12 }), 0); }, 'Wrack: unzerstörbar, prallt stark ab');
  legendRow(legend, function (c) { drawGateOn(c, { x: 0, y: 0, r: 12 }, 0, 0); }, 'Warp-Tor: bringt die Drohne zum Partner-Tor');
  legendRow(legend, function (c) { drawPegOn(c, fakePeg('n', { hp: 3, hpMax: 3 }), 0); }, 'Panzer-Brocken: brauchen 2 bis 3 Treffer');
  legendRow(legend, function (c) { [[-7, 'n'], [7, 'z']].forEach(function (s, i) { drawStoneOn(c, fakePeg(s[1], { st: 1, x: s[0], y: 2 - i * 4, r: 4.5, a: -0.28, dl: 9, id: i }), 0); }); }, 'Rollbahn: Drohne rollt darauf, jeder Stein leuchtet beim Berühren – abgebaute Steine lassen sie durch');
  legendRow(legend, function (c) { drawRampOn(c, { x1: -10, y1: 5, x2: 10, y2: -5 }); }, 'Rampe: die Drohne prallt ab');
  legendRow(legend, function (c) { drawTrackOn(c, railPath([{ x: -11, y: 6 }, { x: 0, y: -2 }, { x: 11, y: 6 }]), 0.3); }, 'Beschleunigerbahn: die Drohne fährt mit und wird am Ende rausgeschossen');
  legendRow(legend, function (c) { c.strokeStyle = 'rgba(160,190,230,.5)'; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(-13, 0); c.lineTo(13, 0); c.stroke(); c.setLineDash([]); drawPegOn(c, fakePeg('n'), 0); }, 'Gleiter: gleiten, kreisen, pulsieren, schlagen Wellen oder fliegen Achten – Wracks, Tore und Felder wandern ab höheren Leveln mit');
  legendRow(legend, function (c) { drawWell(c, { x: 0, y: 0, r: 13, k: 1 }, 0.3); }, 'Gravitationsfeld (blau): zieht die Drohne an');
  legendRow(legend, function (c) { drawWell(c, { x: 0, y: 0, r: 13, k: -1 }, 0.3); }, 'Abstoßfeld (rot): stößt die Drohne weg');
  Object.keys(POWER_NAMES).forEach(function (k) {
    legendRow(legendP, function (c) { drawPegOn(c, fakePeg('g', { power: k }), 0); }, obT(POWER_NAMES[k]) + ': ' + obT(POWER_INFO[k]) + (POWER_UNLOCK[k] ? tt(' (ab Level ', ' (from level ') + POWER_UNLOCK[k] + ')' : ''));
  });

  /* --- Highscore-Liste --- */
  var scores = Highscores.load(store, hsKey);
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(OB_EN ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function renderScores(hiRank) {
    scoreList.textContent = '';
    if (!scores.length) { var e = el('p', 'ob-empty', 'Noch keine Einträge. Spiel eine Kampagne!'); scoreList.appendChild(e); return; }
    scores.forEach(function (s, i) {
      var li = el('li', (hiRank && i + 1 === hiRank) ? 'ob-new' : '');
      li.appendChild(el('span', 'ob-rk', String(i + 1)));
      li.appendChild(el('span', 'ob-nm', s.name + (s.won ? ' ✔' : '')));
      li.appendChild(el('span', 'ob-sc', fmtScore(s.score)));
      var dt = fmtDate(s.date), extra = s.lvl ? 'Level ' + s.lvl + '/' + LEVELS.length : '';
      if (dt || extra) li.appendChild(el('span', 'ob-dt', [dt, extra].filter(Boolean).join(' · ')));
      scoreList.appendChild(li);
    });
  }

  /* --- Größe und Hintergrund --- */
  /* OB4: Szene (bewegt sich ganz leicht = Parallaxe) und fester Rahmen (Raster, Vignette, Schienen) getrennt vorgezeichnet */
  var BGM = 24, bgSpin = null, frame = null;
  function renderBg() {
    var cw = canvas.width, ch = canvas.height, k = cw / W, sc = obSceneOf(game.level), rnd = mulberry32(900 + game.level * 31), i;
    bgLevel = game.level;
    bg = document.createElement('canvas'); bg.width = Math.round((W + 2 * BGM) * k); bg.height = Math.round((H + 2 * BGM) * k);
    var g = bg.getContext('2d'); g.setTransform(k, 0, 0, k, BGM * k, BGM * k);
    bgSpin = obPaintScene(g, sc.kind, sc.hue, rnd, W, H, BGM, k);
    frame = document.createElement('canvas'); frame.width = cw; frame.height = ch;
    g = frame.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0);
    g.strokeStyle = hsla(sc.hue, 70, 75, 0.045); g.lineWidth = 1;
    for (var x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (var y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    var vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);                                                  // Vignette
    [[0, 1], [W - 6, -1]].forEach(function (rl) {                                              // Energie-Schienen an den Seiten
      var sg2 = g.createLinearGradient(rl[0], 0, rl[0] + 6, 0);
      sg2.addColorStop(rl[1] > 0 ? 0 : 1, 'rgba(255,154,31,.45)'); sg2.addColorStop(rl[1] > 0 ? 1 : 0, 'rgba(255,154,31,0)');
      g.fillStyle = sg2; g.fillRect(rl[0], 0, 6, H);
    });
    g.strokeStyle = 'rgba(255,154,31,.55)'; g.lineWidth = 2;
    [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].forEach(function (c) {
      g.beginPath(); g.moveTo(c[0] + c[2] * 22, c[1] + c[3] * 2); g.lineTo(c[0] + c[2] * 2, c[1] + c[3] * 2); g.lineTo(c[0] + c[2] * 2, c[1] + c[3] * 22); g.stroke();
    });
  }
  function drawBg(t) {
    var dx = Math.sin(t * 0.05) * BGM * 0.7, dy = Math.cos(t * 0.037) * BGM * 0.55;
    ctx.drawImage(bg, -BGM + dx, -BGM + dy, W + 2 * BGM, H + 2 * BGM);
    if (bgSpin) {
      ctx.save(); ctx.translate(bgSpin.x + dx, bgSpin.y + dy); ctx.rotate(t * bgSpin.rot); ctx.drawImage(bgSpin.c, -bgSpin.w / 2, -bgSpin.w / 2, bgSpin.w, bgSpin.w); ctx.restore();
      if (bgSpin.over) { ctx.save(); ctx.translate(dx, dy); bgSpin.over(ctx); ctx.restore(); }
    }
  }
  function resize() {
    if (statEls.level) setTimeout(function () { fitStat(statEls.level); fitStat(statEls.score); }, 0);   // nach dem Umbruch der Anzeigen neu einpassen
    var cssW = canvas.clientWidth || 360;
    dpr = Math.min(win.devicePixelRatio || 1, 2);
    var cw = Math.max(200, Math.round(cssW * dpr));
    canvas.width = cw; canvas.height = Math.round(cw * H / W);
    scale = cw / W;
    renderBg();
  }
  var ro = null;
  if (win.ResizeObserver) { ro = new win.ResizeObserver(function () { resize(); }); ro.observe(canvas); }
  else win.addEventListener('resize', resize);

  /* --- Zeichnen: Laser, Frachter, Gesamtbild --- */
  function drawWell(c, w, t) {                                       // Gravitations- (blau, zieht ein) und Abstoßfeld (rot, stößt aus)
    var att = w.k > 0, col = att ? '110,170,255' : '255,100,120', i;
    c.save(); c.translate(w.x, w.y);
    var g = c.createRadialGradient(0, 0, 0, 0, 0, w.r); g.addColorStop(0, 'rgba(' + col + ',' + (att ? '.28' : '.10') + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, w.r, 0, 6.2832); c.fill();
    c.lineWidth = 1.6;
    for (i = 0; i < 4; i++) {
      var f = (t * 0.45 + i / 4) % 1, rad = w.r * (att ? 1 - f : f);
      c.strokeStyle = 'rgba(' + col + ',' + (0.4 * (att ? f : 1 - f)) + ')'; c.beginPath(); c.arc(0, 0, Math.max(1, rad), 0, 6.2832); c.stroke();
    }
    c.rotate(t * (att ? -1.6 : 1.6)); c.strokeStyle = 'rgba(' + col + ',.85)'; c.lineWidth = 2.2; c.shadowColor = 'rgb(' + col + ')'; c.shadowBlur = 8;
    for (i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, 11, i * 2.0944, i * 2.0944 + 1.2); c.stroke(); }
    c.shadowBlur = 0; c.fillStyle = 'rgba(' + col + ',.9)'; c.beginPath(); c.arc(0, 0, 3, 0, 6.2832); c.fill();
    c.restore();
  }
  function drawNet(t) {                                                // Rettungsnetz am unteren Rand
    var y = H - 5, n = game.net;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createLinearGradient(0, y - 22, 0, y + 5); g.addColorStop(0, 'rgba(94,216,255,0)'); g.addColorStop(1, 'rgba(94,216,255,' + (0.18 + 0.1 * n) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, y - 22, W, 27);
    ctx.strokeStyle = 'rgba(160,235,255,.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (var x = 0; x <= W; x += 24) { ctx.moveTo(x, y - 16); ctx.lineTo(x + 12, y + 4); ctx.moveTo(x + 12, y - 16); ctx.lineTo(x, y + 4); }
    ctx.moveTo(0, y - 8); ctx.lineTo(W, y - 8); ctx.stroke();
    ctx.strokeStyle = 'rgba(190,245,255,' + (0.7 + 0.3 * Math.sin(t * 6)) + ')'; ctx.lineWidth = 2; ctx.shadowColor = '#5ed8ff'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(0, y - 16); ctx.lineTo(W, y - 16); ctx.stroke();
    ctx.restore();
  }
  function hazard(c, x, y, w, h) {                                   // gelb-schwarzer Warnstreifen
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#e0a800'; c.fillRect(x, y, w, h); c.fillStyle = '#1a1a1a';
    for (var i = -h; i < w + h; i += 8) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + 4, y + h); c.lineTo(x + i + 4 + h, y); c.lineTo(x + i + h, y); c.closePath(); c.fill(); }
    c.restore();
  }
  function drawLaser(t) {
    var k = Math.max(0, laserT / 0.22), lx = CFG.launcherX, ly = CFG.launcherY - 4, vol = game.volley;
    var acc = vol ? '#ff8fd8' : '#ff9a1f', accRgb = vol ? '255,143,216' : '255,154,31', pulse = 0.5 + 0.5 * Math.sin(t * 7), c = ctx, i, sd;
    c.save();
    // --- Deckenschiene ---
    var pg = c.createLinearGradient(0, 0, 0, 20); pg.addColorStop(0, '#4a5a70'); pg.addColorStop(0.55, '#2a3544'); pg.addColorStop(1, '#141a24');
    c.fillStyle = pg; c.strokeStyle = '#7f9bbd'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(lx - 118, 0); c.lineTo(lx + 118, 0); c.lineTo(lx + 96, 19); c.lineTo(lx - 96, 19); c.closePath(); c.fill(); c.stroke();
    hazard(c, lx - 94, 15, 188, 4);
    c.fillStyle = 'rgba(0,0,0,.45)'; for (i = -4; i <= 4; i++) c.fillRect(lx + i * 20 - 6, 4, 12, 5);          // Schlitze
    c.fillStyle = 'rgba(' + accRgb + ',' + (0.55 + 0.35 * pulse) + ')'; for (i = -4; i <= 4; i++) c.fillRect(lx + i * 20 - 2, 5.5, 4, 2);   // Statuslichter
    // --- Streben ---
    [-1, 1].forEach(function (sg) {
      var sgd = c.createLinearGradient(lx + sg * 20, 0, lx + sg * 60, 0); sgd.addColorStop(0, '#2c3745'); sgd.addColorStop(1, '#465569');
      c.fillStyle = sgd; c.strokeStyle = '#7f9bbd'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(lx + sg * 70, 18); c.lineTo(lx + sg * 46, 18); c.lineTo(lx + sg * 12, 40); c.lineTo(lx + sg * 22, 49); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#9db6d6'; c.beginPath(); c.arc(lx + sg * 58, 23, 2, 0, 6.2832); c.fill();
    });
    // --- Drehkranz ---
    var hg = c.createRadialGradient(lx - 4, ly - 6, 2, lx, ly, 17); hg.addColorStop(0, '#6b7f99'); hg.addColorStop(0.6, '#2a3544'); hg.addColorStop(1, '#10151d');
    c.fillStyle = hg; c.strokeStyle = '#9db6d6'; c.lineWidth = 1.4; c.beginPath(); c.arc(lx, ly, 15, 0, 6.2832); c.fill(); c.stroke();
    c.save(); c.translate(lx, ly); c.rotate(game.aim * 2.5); c.strokeStyle = 'rgba(' + accRgb + ',.85)'; c.lineWidth = 2; c.shadowColor = acc; c.shadowBlur = 6;
    for (i = 0; i < 10; i++) { c.beginPath(); c.arc(0, 0, 11.5, i * 0.6283, i * 0.6283 + 0.24); c.stroke(); } c.restore();
    // --- Rohr ---
    c.save(); c.translate(lx, ly); c.rotate(-game.aim); c.translate(0, -k * 4);
    var barrels = vol ? [-CFG.volleySpread, 0, CFG.volleySpread] : [0];
    barrels.forEach(function (d) {
      c.save(); c.rotate(-d);
      var sc = d === 0 ? 1 : 0.78, bw = 11 * sc;
      var bg = c.createLinearGradient(-bw, 0, bw, 0); bg.addColorStop(0, '#222c3a'); bg.addColorStop(0.35, '#8ba3c2'); bg.addColorStop(0.55, '#c3d3e8'); bg.addColorStop(1, '#202a38');
      c.fillStyle = bg; c.strokeStyle = '#1a212c'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-bw, -2); c.lineTo(bw, -2); c.lineTo(bw * 0.58, 31); c.lineTo(-bw * 0.58, 31); c.closePath(); c.fill(); c.stroke();      // Hauptrohr (verjüngt)
      c.fillStyle = '#10151d'; for (i = 0; i < 4; i++) c.fillRect(-bw + i * 0.9 - 1.5, 12 + i * 4.6, (bw - i * 0.9) * 2 + 3, 2);                                          // Kühlringe
      c.fillStyle = acc; c.fillRect(-1.5 * sc, 8, 3 * sc, 19);                                                                                      // Energieader
      c.fillStyle = '#313e50'; c.strokeStyle = '#9db6d6'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-bw * 0.8, 29); c.lineTo(-bw * 0.95, 37); c.lineTo(-bw * 0.35, 37); c.lineTo(-bw * 0.35, 31); c.closePath(); c.fill(); c.stroke();   // Fokus-Gabel
      c.beginPath(); c.moveTo(bw * 0.8, 29); c.lineTo(bw * 0.95, 37); c.lineTo(bw * 0.35, 37); c.lineTo(bw * 0.35, 31); c.closePath(); c.fill(); c.stroke();
      var lr = (4 + pulse * 1.5 + k * 4) * sc;
      var lg = c.createRadialGradient(0, 33, 0, 0, 33, lr * 3.2); lg.addColorStop(0, 'rgba(255,255,255,.95)'); lg.addColorStop(0.25, 'rgba(' + accRgb + ',.9)'); lg.addColorStop(1, 'rgba(' + accRgb + ',0)');
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lg; c.beginPath(); c.arc(0, 33, lr * 3.2, 0, 6.2832); c.fill(); c.restore();    // Fokuslinse
      c.fillStyle = '#fff6dc'; c.beginPath(); c.arc(0, 33, lr * 0.55, 0, 6.2832); c.fill();
      if (k > 0.05) {                                                   // Mündungsblitz mit Strahlen
        c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,240,200,' + k + ')'; c.lineWidth = 2.2; c.shadowColor = acc; c.shadowBlur = 12;
        for (i = 0; i < 6; i++) { var an = i * 1.0472 + 0.3; c.beginPath(); c.moveTo(Math.cos(an) * 5, 33 + Math.sin(an) * 5); c.lineTo(Math.cos(an) * (10 + 26 * k), 33 + Math.sin(an) * (10 + 26 * k)); c.stroke(); }
        c.restore();
      }
      c.restore();
    });
    c.restore();
    // --- Gehäusedeckel + Statuslampe ---
    var cg = c.createRadialGradient(lx - 2, ly - 3, 1, lx, ly, 9); cg.addColorStop(0, '#8aa0bd'); cg.addColorStop(1, '#222c3a');
    c.fillStyle = cg; c.strokeStyle = '#b9cde6'; c.lineWidth = 1.2; c.beginPath(); c.arc(lx, ly, 8, 0, 6.2832); c.fill(); c.stroke();
    c.fillStyle = acc; c.shadowColor = acc; c.shadowBlur = 8 + 6 * pulse; c.beginPath(); c.arc(lx, ly, 2.6, 0, 6.2832); c.fill(); c.shadowBlur = 0;
    c.restore();
  }
  function drawBeam() {
    if (laserT <= 0 || !beamPts || beamPts.length < 2) return;
    var k = laserT / 0.22;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath(); ctx.moveTo(beamPts[0].x, beamPts[0].y);
    for (var i = 1; i < beamPts.length; i++) ctx.lineTo(beamPts[i].x, beamPts[i].y);
    ctx.globalAlpha = 0.35 * k; ctx.strokeStyle = '#ff7a10'; ctx.lineWidth = 20; ctx.stroke();
    ctx.globalAlpha = 0.65 * k; ctx.strokeStyle = '#ffb23a'; ctx.lineWidth = 9; ctx.shadowColor = '#ff9a1f'; ctx.shadowBlur = 22; ctx.stroke();
    ctx.globalAlpha = 1 * k; ctx.strokeStyle = '#fffbea'; ctx.lineWidth = 3; ctx.shadowBlur = 0; ctx.stroke();
    var e = beamPts[beamPts.length - 1], eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 26 * k + 8);
    eg.addColorStop(0, 'rgba(255,250,230,.95)'); eg.addColorStop(1, 'rgba(255,150,30,0)');
    ctx.globalAlpha = k; ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(e.x, e.y, 26 * k + 8, 0, 6.2832); ctx.fill();            // Einschlag-Blitz
    ctx.restore();
  }
  function drawCargo(c, x, y, w, h, col) {                           // gerippter Frachtcontainer
    var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#6c7f98'); g.addColorStop(0.15, '#455469'); g.addColorStop(1, '#232c3a');
    c.fillStyle = g; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    c.fillStyle = col; c.fillRect(x + 2, y + h * 0.38, w - 4, h * 0.26);
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x + 2, y + h * 0.38, w - 4, 1.5);
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.beginPath(); for (var i = 1; i < 4; i++) { c.moveTo(x + i * w / 4, y + 2); c.lineTo(x + i * w / 4, y + h - 2); } c.stroke();
  }
  /* Neuer Frachter: Ansicht von hinten (dunkel, Sternzerstörer-Stil), 2 große Triebwerke.
     c = Zeichenfläche, bk = game.bucket {x,y,w}, t = Zeit in s, fl = Fang-Blitz 0..1, thr = weiche Fahrtrichtung -1..1 (positiv = nach rechts) */
  function drawFreighterNew(c, bk, t, fl, thr, hazard, drawCargo) {
    var hw = bk.w / 2, i, e, pulse = 0.86 + 0.14 * Math.sin(t * 23) + 0.06 * Math.sin(t * 61), sp = Math.abs(thr);
    var blink = Math.floor(t * 1.6) % 2, boost = 1 + fl * 0.7;
    var cols = ['#7a4a2a', '#2f5a6a', '#6a2e2a', '#7a6428'];
    c.save(); c.translate(bk.x, bk.y); c.rotate(thr * 0.02);
    var mains = [[-88, 16.5, 10.5], [88, 16.5, 10.5]], smalls = [], BD = 19;
    // --- Triebwerks-Schein (additiv, hinter dem Rumpf) ---
    c.save(); c.globalCompositeOperation = 'lighter';
    mains.concat(smalls).forEach(function (n) {
      var R = n[2] * 4.6 * boost * (0.95 + 0.2 * sp), g = c.createRadialGradient(n[0], n[1], 0, n[0], n[1], R);
      g.addColorStop(0, 'rgba(150,205,255,' + (0.75 * pulse) + ')'); g.addColorStop(0.35, 'rgba(90,160,255,' + (0.3 * pulse) + ')'); g.addColorStop(1, 'rgba(40,110,255,0)');
      c.fillStyle = g; c.beginPath(); c.arc(n[0], n[1], R, 0, 6.2832); c.fill();
    });
    c.restore();
    // --- Rumpfplatte (Heck) ---
    var hg = c.createLinearGradient(0, 3, 0, 29); hg.addColorStop(0, '#3b4759'); hg.addColorStop(0.3, '#232b37'); hg.addColorStop(1, '#0b0f15');
    c.fillStyle = hg; c.strokeStyle = '#5b6c84'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(-114, 10); c.lineTo(-106, 3); c.lineTo(106, 3); c.lineTo(114, 10); c.lineTo(114, 22); c.lineTo(100, 29); c.lineTo(-100, 29); c.lineTo(-114, 22); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 1; c.beginPath();
    for (i = -96; i <= 96; i += 12) { c.moveTo(i, 4); c.lineTo(i, 28); }
    c.moveTo(-112, 15); c.lineTo(112, 15); c.stroke();
    c.strokeStyle = 'rgba(120,140,170,.18)'; c.beginPath(); for (i = -108; i <= 100; i += 24) { c.moveTo(i, 4); c.lineTo(i + 10, 28); } c.stroke();   // Panzerplatten
    c.fillStyle = 'rgba(190,210,235,.35)'; for (i = -108; i <= 108; i += 8) c.fillRect(i, 5, 1.3, 1.3);   // Nieten
    // --- Seitenflügel: Deck, Container (links, dann gespiegelt) ---
    for (e = -1; e <= 1; e += 2) {
      c.save(); c.scale(e, 1);
      var dg = c.createLinearGradient(0, -16, 0, 3); dg.addColorStop(0, '#46546a'); dg.addColorStop(1, '#1b222d');
      c.fillStyle = dg; c.strokeStyle = '#6a7d98'; c.lineWidth = 1.1;
      c.beginPath(); c.moveTo(-112, 3); c.lineTo(-104, -6); c.lineTo(-hw - 8, -6); c.lineTo(-hw - 8, 3); c.closePath(); c.fill(); c.stroke();   // Deck
      drawCargo(c, -hw - 7 + 0, -13, 11, 9, cols[0]); drawCargo(c, -hw - 7 + 12, -13, 11, 9, cols[1]);                                       // Container
      c.fillStyle = '#1f2733'; c.fillRect(-hw - 8, -15, 25, 2.6);
      for (i = 0; i < 4; i++) { c.fillStyle = (i + Math.floor(t * 0.8)) % 3 === 0 ? '#ffe6a8' : 'rgba(255,200,110,.55)'; c.fillRect(-108 + i * 3.6, -3, 2, 1.6); }   // Fensterreihe am Deck
      c.fillStyle = '#ff9a1f'; c.fillRect(-110, 6, 38, 1.6);                                                                                      // Omni-Streifen
      c.restore();
    }
    // --- Frachtschacht (offen nach oben) ---
    var wgr = c.createLinearGradient(0, 0, 0, BD); wgr.addColorStop(0, '#03060a'); wgr.addColorStop(1, fl > 0 ? 'rgba(70,224,138,' + (0.35 + 0.45 * fl) + ')' : '#102030');
    c.fillStyle = wgr; c.fillRect(-hw, -1, bk.w, BD + 1);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.moveTo(-hw, -1); c.lineTo(-hw + 7, 3); c.lineTo(-hw + 7, BD); c.lineTo(-hw, BD); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(hw, -1); c.lineTo(hw - 7, 3); c.lineTo(hw - 7, BD); c.lineTo(hw, BD); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,160,200,.2)'; c.lineWidth = 1; c.beginPath(); for (i = 1; i < 12; i++) { c.moveTo(-hw + i * bk.w / 12, 0); c.lineTo(-hw + i * bk.w / 12, BD - 1); } c.stroke();
    c.fillStyle = fl > 0 ? '#9bffc4' : '#ffb14a';
    for (i = 0; i < 7; i++) { var on = (Math.floor(t * 7) % 7) === i; c.globalAlpha = fl > 0 ? 1 : (on ? 1 : 0.4); c.beginPath(); c.arc(-hw + 10 + i * (bk.w - 20) / 6, BD - 4, 2.1, 0, 6.2832); c.fill(); } c.globalAlpha = 1;
    if (fl > 0) { var f2 = c.createRadialGradient(0, 0, 4, 0, 0, hw + 20); f2.addColorStop(0, 'rgba(155,255,196,' + fl * 0.8 + ')'); f2.addColorStop(1, 'rgba(70,224,138,0)'); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = f2; c.fillRect(-hw - 20, -26, bk.w + 40, 50); c.restore(); }
    for (e = -1; e <= 1; e += 2) {                                          // Schachtpfeiler
      var rx = e < 0 ? -hw - 6 : hw;
      c.fillStyle = '#2b3646'; c.strokeStyle = '#7b90ad'; c.lineWidth = 1; c.fillRect(rx, -14, 6, 34); c.strokeRect(rx, -14, 6, 34);
      hazard(c, rx, -14, 6, 8);
      var gl = Math.floor(t * 3) % 2; c.fillStyle = gl ? '#46e08a' : '#1f4a33'; c.shadowColor = '#46e08a'; c.shadowBlur = gl ? 8 : 0; c.beginPath(); c.arc(rx + 3, -18, 2.1, 0, 6.2832); c.fill(); c.shadowBlur = 0;
    }
    c.strokeStyle = fl > 0 ? '#9bffc4' : 'rgba(255,177,74,.85)'; c.lineWidth = 1.6; c.shadowColor = c.strokeStyle; c.shadowBlur = 6;
    c.beginPath(); c.moveTo(-hw, -1); c.lineTo(hw, -1); c.stroke(); c.shadowBlur = 0;                                                            // Fanglinie
    // --- Haupt- und Hilfstriebwerke (Blick in die Düsen) ---
    mains.concat(smalls).forEach(function (n, k) {
      var x = n[0], y = n[1], r = n[2], big = true;
      c.fillStyle = '#1b2230'; c.strokeStyle = '#6a7d98'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, r + 2.4, 0, 6.2832); c.fill(); c.stroke();
      c.fillStyle = '#04070b'; c.strokeStyle = '#6ab8ff'; c.lineWidth = 1.3; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); c.stroke();
      var cg = c.createRadialGradient(x, y, 0, x, y, r * 1.05 * boost); cg.addColorStop(0, 'rgba(255,255,255,1)'); cg.addColorStop(0.4, 'rgba(170,220,255,' + Math.min(1, 0.95 * pulse) + ')'); cg.addColorStop(0.75, 'rgba(90,160,255,' + (0.7 * pulse) + ')'); cg.addColorStop(1, 'rgba(40,110,255,0)');
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = cg; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
      var hl = c.createRadialGradient(x, y, r * 0.8, x, y, r * 2.1 * boost); hl.addColorStop(0, 'rgba(120,190,255,' + (0.45 * pulse) + ')'); hl.addColorStop(1, 'rgba(40,110,255,0)'); c.fillStyle = hl; c.beginPath(); c.arc(x, y, r * 2.1 * boost, 0, 6.2832); c.fill(); c.restore();
      c.strokeStyle = 'rgba(160,215,255,' + (0.35 * pulse) + ')'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r * 0.62, 0, 6.2832); c.stroke();   // heißer Innenring
    });
    // --- Seitendüsen (links/rechts): brennen je nach Fahrtrichtung ---
    for (e = -1; e <= 1; e += 2) {
      var push = e < 0 ? Math.max(0, thr) : Math.max(0, -thr);               // linke Düse schiebt nach rechts und umgekehrt
      [8, 15].forEach(function (ny, ni) {
        var bx = e * 114;
        c.fillStyle = '#10151d'; c.strokeStyle = '#6ab8ff'; c.lineWidth = 1.1; c.fillRect(e < 0 ? bx - 5 : bx, ny - 3, 5, 6); c.strokeRect(e < 0 ? bx - 5 : bx, ny - 3, 5, 6);
        var L = 3 + (27 + 7 * ni) * push * (0.9 + 0.1 * pulse), x0 = e * 114 + e * 0.5, x1 = x0 + e * L;
        c.save(); c.globalCompositeOperation = 'lighter';
        var fg = c.createLinearGradient(x0, 0, x1, 0); fg.addColorStop(0, 'rgba(235,247,255,.85)'); fg.addColorStop(0.3, 'rgba(120,195,255,.6)'); fg.addColorStop(1, 'rgba(40,110,255,0)');
        c.fillStyle = fg; c.beginPath(); c.moveTo(x0, ny - 2.8); c.lineTo(x1, ny); c.lineTo(x0, ny + 2.8); c.closePath(); c.fill();
        c.fillStyle = 'rgba(120,195,255,' + (0.25 + 0.5 * pulse * (1 - push)) + ')'; c.beginPath(); c.arc(x0, ny, 1.6, 0, 6.2832); c.fill();
        if (push > 0.05) { var bl = c.createRadialGradient(x0 + e * 3, ny, 0, x0 + e * 3, ny, 11); bl.addColorStop(0, 'rgba(140,200,255,' + (0.38 * push) + ')'); bl.addColorStop(1, 'rgba(40,110,255,0)'); c.fillStyle = bl; c.beginPath(); c.arc(x0 + e * 3, ny, 11, 0, 6.2832); c.fill(); }
        c.restore();
      });
    }
    c.restore();
  }
  var thrS = 0, thrT = 0;                                          // weiche Fahrtrichtung der Schubdüsen
  function drawFreighter(t) {
    var bk = game.bucket, dt = Math.max(0, Math.min(0.05, t - thrT)); thrT = t;
    thrS += ((bk.dir || 1) * (paused ? 0 : 1) - thrS) * Math.min(1, dt * 5);
    drawFreighterNew(ctx, bk, t, catchT > 0 ? catchT / 0.6 : 0, thrS, hazard, drawCargo);
  }
  function drawBall(b) {
    var tr = b.trail || [], i, hot = b.pierce > 0, col = hot ? '#ffb347' : '#4cc3ff', col2 = hot ? '255,150,40' : '76,195,255';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 1; i < tr.length; i++) {                                  // Schweif als leuchtendes Band
      var f = i / tr.length;
      ctx.globalAlpha = f * 0.55; ctx.strokeStyle = col; ctx.lineWidth = 1 + 9 * f; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tr[i - 1].x, tr[i - 1].y); ctx.lineTo(tr[i].x, tr[i].y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    var bl = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r * 3.6); bl.addColorStop(0, 'rgba(' + col2 + ',.55)'); bl.addColorStop(1, 'rgba(' + col2 + ',0)');
    ctx.fillStyle = bl; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 3.6, 0, 6.2832); ctx.fill();
    ctx.restore();
    var gr = ctx.createRadialGradient(b.x - 2.5, b.y - 2.5, 1, b.x, b.y, b.r + 2);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, hot ? '#ffc070' : '#9fe0ff'); gr.addColorStop(1, hot ? '#e86a10' : '#1f8fe0');
    ctx.shadowColor = col; ctx.shadowBlur = hot ? 26 : 16; ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.2832); ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.2;                                   // Drohnen-Ring
    var ang = Math.atan2(b.vy, b.vx);
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 2.2, ang + 0.6, ang + 2.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 2.2, ang + 3.74, ang + 5.64); ctx.stroke();
    if (b.tractor) { ctx.strokeStyle = 'rgba(106,168,255,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 5, 0, 6.2832); ctx.stroke(); }
  }
  function draw(t) {
    if (bgLevel !== game.level) renderBg();
    var sk = shake > 0 && !calm ? shakeA * Math.min(1, shake / 0.3) : 0;   // PR5: Wackeln bei Combos
    ctx.setTransform(scale, 0, 0, scale, sk ? (Math.random() * 2 - 1) * sk * scale : 0, sk ? (Math.random() * 2 - 1) * sk * scale : 0);
    ctx.clearRect(0, 0, W, H);
    var ba = bgA / 100;
    ctx.globalAlpha = ba; if (ba > 0) drawBg(t);
    var i;
    for (i = 0; i < stars.length && ba > 0; i++) {
      var s = stars[i], tw = (0.3 + 0.35 * Math.sin(t * s.ph + i)) * ba; ctx.globalAlpha = tw;
      ctx.fillStyle = s.c; ctx.fillRect(s.x, s.y, s.r, s.r);
      if (s.big) { ctx.globalAlpha = tw * 0.6; ctx.fillRect(s.x - 5, s.y + s.r / 2 - 0.4, 11 + s.r, 0.8); ctx.fillRect(s.x + s.r / 2 - 0.4, s.y - 5, 0.8, 11 + s.r); }
    }
    ctx.globalAlpha = ba; ctx.drawImage(frame, 0, 0, W, H); ctx.globalAlpha = 1;                                  // OB4: Raster, Vignette, Schienen bleiben fest
    // Bahnen der kreisenden Brocken
    var seen = {};
    game.pegs.forEach(function (p) {
      if (!p.mv || p.gone || p.mv.d || p.mv.pa || (p.mv.type && p.mv.type !== 'slide')) return;
      if (p.mv.type === 'slide') {
        var sk = p.mv.x0 + ',' + p.mv.y0 + ',' + p.mv.x1 + ',' + p.mv.y1;
        if (seen[sk]) return; seen[sk] = 1;
        ctx.strokeStyle = 'rgba(160,190,230,.10)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(p.mv.x0, p.mv.y0); ctx.lineTo(p.mv.x1, p.mv.y1); ctx.stroke(); ctx.setLineDash([]);
        return;
      }
      var key = p.mv.cx + ',' + p.mv.cy + ',' + p.mv.rad;
      if (seen[key]) return; seen[key] = 1;
      ctx.strokeStyle = 'rgba(160,190,230,.09)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.mv.cx, p.mv.cy, p.mv.rad, 0, 6.2832); ctx.stroke();
    });
    (game.wells || []).forEach(function (w) { drawWell(ctx, w, t); });
    if (game.net > 0) drawNet(t);
    (game.tracks || []).forEach(function (tr) { drawTrackOn(ctx, tr, t); }); (game.ramps || []).forEach(function (r) { drawRampOn(ctx, r); });   // PQ4
    game.gates.forEach(function (g, gi) { drawGateOn(ctx, g, t, gi); });
    drawFreighter(t);
    for (i = 0; i < game.pegs.length; i++) if (!game.pegs[i].gone) drawPegOn(ctx, game.pegs[i], t);
    if (game.status === 'aiming') {
      var pts = game.predict(), pc = game.volley ? '255,143,216' : '76,195,255';
      ctx.fillStyle = 'rgba(' + pc + ',.85)';
      for (i = 1; i < pts.length; i++) { if (pts[i].hit) break; ctx.globalAlpha = 0.9 - i / pts.length * 0.55; ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 2.6, 0, 6.2832); ctx.fill(); }
      var lastP = pts[pts.length - 1];
      if (lastP && lastP.hit) {                                   // Einschlagpunkt der Flugbahn
        ctx.globalAlpha = 0.9; ctx.strokeStyle = 'rgba(' + pc + ',.95)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(lastP.x, lastP.y, CFG.ballR + 2, 0, 6.2832); ctx.stroke();
      }
      if (game.aimPoint) {                                        // Fadenkreuz = Mauszeiger = Treffpunkt
        var ap = game.aimPoint, rr = 13 + Math.sin(t * 6) * 1.5;
        ctx.globalAlpha = 0.95; ctx.strokeStyle = 'rgba(255,154,31,.95)'; ctx.lineWidth = 1.8; ctx.shadowColor = '#ff9a1f'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(ap.x, ap.y, rr, 0, 6.2832); ctx.stroke();
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) { ctx.beginPath(); ctx.moveTo(ap.x + d[0] * (rr - 4), ap.y + d[1] * (rr - 4)); ctx.lineTo(ap.x + d[0] * (rr + 7), ap.y + d[1] * (rr + 7)); ctx.stroke(); });
        ctx.shadowBlur = 0; ctx.fillStyle = '#fff3cf'; ctx.beginPath(); ctx.arc(ap.x, ap.y, 2, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    drawLaser(t);
    drawBeam();
    for (i = 0; i < game.ballsLeft; i++) {
      ctx.fillStyle = '#4cc3ff'; ctx.shadowColor = '#4cc3ff'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(20 + i * 18, 22, 5, 0, 6.2832); ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (game.volley) { ctx.fillStyle = '#ff8fd8'; ctx.font = '700 12px "Segoe UI",sans-serif'; ctx.textAlign = 'left'; ctx.fillText(obT('SALVE BEREIT'), 20, 44); }
    if (game.net > 0) { ctx.fillStyle = '#5ed8ff'; ctx.font = '700 12px "Segoe UI",sans-serif'; ctx.textAlign = 'left'; ctx.fillText(tt('RETTUNGSNETZ ×', 'SAFETY NET ×') + game.net, 20, game.volley ? 62 : 44); }
    game.balls.forEach(drawBall);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    rings.forEach(function (r) {
      var k = r.t / 0.5; ctx.globalAlpha = Math.max(0, 1 - k); ctx.strokeStyle = r.c || '#ff5a7a'; ctx.lineWidth = (r.lw || 3) * (1.4 - k * 0.6);
      ctx.shadowColor = r.c || '#ff5a7a'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r * k, 0, 6.2832); ctx.stroke();
    });
    ctx.shadowBlur = 0;
    parts.forEach(function (p) {
      var k = Math.max(0, p.life / p.max), rad = p.s * 0.5 * (0.5 + k);
      ctx.globalAlpha = k; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = k * 0.35; ctx.beginPath(); ctx.arc(p.x, p.y, rad * 2.6, 0, 6.2832); ctx.fill();
    });
    bolts.forEach(function (b) {                                       // Kettenblitz
      var k = Math.max(0, b.life / 0.35); ctx.globalAlpha = k; ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 2.4; ctx.shadowColor = '#7fa2ff'; ctx.shadowBlur = 14; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(b.pts[0].x, b.pts[0].y); for (var q = 1; q < b.pts.length; q++) ctx.lineTo(b.pts[q].x, b.pts[q].y); ctx.stroke();
    });
    hbeams.forEach(function (b) {                                      // Laserbahn quer durchs Feld
      var k = Math.max(0, b.life / 0.45), hh = 5 + 20 * k, lg = ctx.createLinearGradient(0, b.y - hh, 0, b.y + hh);
      lg.addColorStop(0, 'rgba(255,90,30,0)'); lg.addColorStop(0.5, 'rgba(255,240,210,' + (0.9 * k) + ')'); lg.addColorStop(1, 'rgba(255,90,30,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = lg; ctx.fillRect(0, b.y - hh, W, hh * 2);
    });
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    texts.forEach(function (tx) {
      var age = tx.max - tx.life, sz = tx.pop ? tx.size * (1 + 0.6 * Math.max(0, 1 - age / 0.22)) : tx.size;   // PR5: groß aufploppen
      ctx.globalAlpha = Math.max(0, tx.life / tx.max); ctx.font = '700 ' + Math.round(sz) + 'px "Segoe UI",sans-serif';
      ctx.fillStyle = tx.c === 'rainbow' ? rainbow(tx.x, ctx.measureText(tx.s).width, t) : tx.c;
      if (tx.glow) { ctx.shadowColor = tx.c === 'rainbow' ? 'hsl(' + Math.floor(t * 240 % 360) + ',100%,60%)' : tx.c; ctx.shadowBlur = 8 + sz / 3; }
      ctx.fillText(tx.s, tx.x, tx.y);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    // Levelname rechts oben
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(215,221,230,.55)'; ctx.font = '600 13px "Segoe UI",sans-serif';
    ctx.fillText((game.level ? 'LEVEL ' + game.level + ' · ' : '') + obLvName(game.levelName).toUpperCase(), W - 16, 24);
    if (flash > 0) { ctx.fillStyle = 'rgba(' + flashC + ',' + (flash * 0.35) + ')'; ctx.fillRect(0, 0, W, H); }
    if (bannerT > 0) {
      var al = Math.min(1, bannerT / 0.6, (3.2 - bannerT) / 0.25 + 0.001);
      ctx.globalAlpha = Math.max(0, al) * 0.62; ctx.fillStyle = '#03050a'; ctx.fillRect(0, 350, W, 140);
      ctx.globalAlpha = Math.max(0, al); ctx.textAlign = 'center';
      // PR5: „LEVEL n“ groß, bunt und leuchtend, fliegt beim Start groß herein
      var lt = game.level ? 'LEVEL ' + game.level : obT('ÜBUNG'), lz = Math.round(48 * (1 + 0.5 * Math.max(0, 1 - (3.2 - bannerT) / 0.3)));
      ctx.font = '800 ' + lz + 'px "Segoe UI",sans-serif'; ctx.fillStyle = rainbow(W / 2, ctx.measureText(lt).width, t);
      ctx.shadowColor = 'hsl(' + Math.floor(t * 240 % 360) + ',100%,60%)'; ctx.shadowBlur = 22; ctx.fillText(lt, W / 2, 398); ctx.shadowBlur = 0;
      if (game.level) { ctx.fillStyle = 'rgba(255,154,31,.8)'; ctx.font = '700 13px "Segoe UI",sans-serif'; ctx.fillText('/ ' + LEVELS.length, W / 2, 416); }
      ctx.fillStyle = '#ffffff'; ctx.font = '700 30px "Segoe UI",sans-serif'; ctx.fillText(obLvName(game.levelName).toUpperCase(), W / 2, 448);
      ctx.fillStyle = '#9fb0c4'; ctx.font = '15px "Segoe UI",sans-serif'; ctx.fillText(obLvDesc(game.levelDesc) + (game.practice ? obT(' · Übung (kein Highscore)') : ''), W / 2, 474);
      ctx.globalAlpha = 1;
    }
  }

  /* --- Ereignisse (Texte, Funken, Töne) --- */
  function rainbow(x, w, t) {   // PR5: wandernder Regenbogen über die Textbreite
    var g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0), h0 = t * 240;
    for (var i = 0; i <= 4; i++) g.addColorStop(i / 4, 'hsl(' + Math.floor((h0 + i * 70) % 360) + ',100%,66%)');
    return g;
  }
  function levelFx() {          // PR5: Levelstart – Ton, Ringe und Funken um die Einblendung
    sound.levelStart();
    for (var k = 0; k < 4; k++) rings.push({ x: W / 2, y: 390, r: 140 + k * 60, t: 0, c: 'hsl(' + (k * 80 + 20) + ',100%,62%)', lw: 3 });
    for (k = 0; k < 46; k++) { var a = Math.random() * 6.2832, v = 120 + Math.random() * 260; parts.push({ x: W / 2, y: 390, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, s: 2 + Math.random() * 2.5, life: 1.1, max: 1.1, c: 'hsl(' + Math.floor(Math.random() * 360) + ',100%,65%)' }); }
  }
  function hitColor(e) { return e.t === 'g' ? PCOL[e.power || 'bomb'].hi : COL[e.t].hi; }
  function handleEvents() {
    var ev = game.events; game.events = [];
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i], k, a, v;
      if (e.type === 'fire') {
        laserT = 0.22; beamPts = game.predict(e.aim); sound.fire(e.volley); bannerT = Math.min(bannerT, 0.5);
        if (e.volley) texts.push({ x: CFG.launcherX, y: 120, vy: -30, life: 1.0, max: 1.0, s: obT('SALVE!'), c: PCOL.volley.glow, size: 22 });
      } else if (e.type === 'hit') {
        sound.hit(e, game.shotHits || game.hitsTotal);
        texts.push({ x: e.x, y: e.y - 10, vy: -40, life: 0.9, max: 0.9, s: '+' + fmtScore(e.pts), c: hitColor(e), size: e.t === 'n' ? 12 : 16 });
      } else if (e.type === 'power') {
        sound.power(e.kind, e.x);
        texts.push({ x: e.x, y: e.y - 28, vy: -34, life: 1.4, max: 1.4, s: obT(POWER_NAMES[e.kind]) + '!', c: PCOL[e.kind].glow, size: 20 });
        rings.push({ x: e.x, y: e.y, r: 70, t: 0, c: PCOL[e.kind].glow, lw: 4 });
      } else if (e.type === 'gone') {
        sound.gone(e.x);
        var gc = (e.t === 'g' ? PCOL.bomb : COL[e.t] || COL.n).glow;
        for (k = 0; k < 8; k++) { a = Math.random() * 6.2832; v = 40 + Math.random() * 90; parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, s: 2 + Math.random() * 2.5, life: 0.7, max: 0.7, c: gc }); }
      } else if (e.type === 'boom') {
        if (e.small) sound.armor(e.x); else { sound.boom(e.x); flash = Math.max(flash, 0.45); }   // Splitter: kleiner Knall
        rings.push({ x: e.x, y: e.y, r: e.r, t: 0, c: '#ff5a7a', lw: 4 });
        for (k = 0; k < 26; k++) { a = Math.random() * 6.2832; v = 80 + Math.random() * 220; parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 2 + Math.random() * 3, life: 0.8, max: 0.8, c: Math.random() < 0.5 ? '#ffb070' : '#ff5a7a' }); }
      } else if (e.type === 'bump') {
        sound.bump(e.x); bumpT[e.id] = 0.15; rings.push({ x: e.x, y: e.y, r: 38, t: 0, c: '#ffffff', lw: 2 });
      } else if (e.type === 'ramp') {
        sound.bump(e.x); rings.push({ x: e.x, y: e.y, r: 26, t: 0, c: '#9fe0ff', lw: 2 });
      } else if (e.type === 'rail' || e.type === 'railOut') {
        sound.armor(e.x); rings.push({ x: e.x, y: e.y, r: e.type === 'rail' ? 30 : 46, t: 0, c: '#4cc3ff', lw: 2.5 });
      } else if (e.type === 'warp') {
        sound.warp(e.x);
        rings.push({ x: e.x, y: e.y, r: 60, t: 0, c: '#4cc3ff', lw: 3 }); rings.push({ x: e.x2, y: e.y2, r: 60, t: 0, c: '#b46bff', lw: 3 });
      } else if (e.type === 'catch') {
        catchT = 0.6; sound.catchShip();
        texts.push({ x: e.x, y: e.y - 40, vy: -50, life: 1.3, max: 1.3, s: e.free ? obT('Frachter! +1 Drohne') : tt('Frachter! +', 'Freighter! +') + e.pts, c: '#ffd08a', size: 18 });
      } else if (e.type === 'combo') {
        // PR5: Stufen 5/10/20/40 – große Regenbogen-Schrift, Wackeln, farbiger Blitz, Funkenregen; neue Stufe mit Akkord
        var tier = e.n >= 40 ? 4 : e.n >= 20 ? 3 : e.n >= 10 ? 2 : 1, cw = ['COMBO', 'SUPER COMBO', 'MEGA COMBO', 'OMNI COMBO'][tier - 1];
        sound.combo(e.n);
        if (e.n === 5 || e.n === 10 || e.n === 20 || e.n === 40) { sound.comboTier(tier); }
        texts.push({ x: e.x, y: e.y - 36, vy: -46, life: 1.2, max: 1.2, s: 'COMBO ' + e.n + '!', c: '#ffe14c', size: 24, glow: 1 });
        texts.push({ x: W / 2, y: 290, vy: -16, life: 1.3 + tier * 0.2, max: 1.3 + tier * 0.2, s: cw + ' ×' + e.n, c: 'rainbow', size: 30 + tier * 8, glow: 1, pop: 1 });
        rings.push({ x: e.x, y: e.y, r: 60 + e.n * 2, t: 0, c: '#ffe14c', lw: 3 });
        if (tier >= 2) rings.push({ x: W / 2, y: 280, r: 120 + tier * 40, t: 0, c: 'hsl(' + (tier * 70) + ',100%,65%)', lw: 2 + tier });
        for (k = 0; k < 10 + tier * 12; k++) { a = Math.random() * 6.2832; v = 90 + Math.random() * (120 + tier * 60); parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, s: 2 + Math.random() * 2.5, life: 0.9, max: 0.9, c: 'hsl(' + Math.floor(Math.random() * 360) + ',100%,65%)' }); }
        shake = Math.max(shake, 0.2 + tier * 0.1); shakeA = Math.max(shakeA, 2 + tier * 2.5);
        flash = Math.max(flash, 0.15 + tier * 0.1); flashC = ['255,225,76', '76,195,255', '255,107,214', '180,107,255'][tier - 1];
      } else if (e.type === 'comboBonus') {
        sound.comboBonus(e.hits);
        texts.push({ x: W / 2, y: 330, vy: -26, life: 2.0, max: 2.0, s: 'COMBO ×' + e.hits, c: '#ffe14c', size: 34 });
        texts.push({ x: W / 2, y: 366, vy: -26, life: 2.0, max: 2.0, s: '+' + fmtScore(e.pts) + tt(' Combo-Bonus', ' combo bonus'), c: '#fff3b0', size: 20 });
        flash = Math.max(flash, Math.min(0.5, e.hits / 40));
      } else if (e.type === 'armor') {
        sound.armor(e.x); bumpT[e.id] = 0.12; rings.push({ x: e.x, y: e.y, r: 34, t: 0, c: '#c9d6e8', lw: 2 });
        for (k = 0; k < 6; k++) { a = Math.random() * 6.2832; v = 60 + Math.random() * 120; parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 1.6 + Math.random() * 1.6, life: 0.45, max: 0.45, c: '#dbe6f5' }); }
        texts.push({ x: e.x, y: e.y - 12, vy: -30, life: 0.7, max: 0.7, s: e.hp === 1 ? obT('Panzer geknackt!') : tt('Panzer ×', 'Armor ×') + e.hp, c: '#dbe6f5', size: 12 });
      } else if (e.type === 'zap') {
        var zp = [{ x: e.x, y: e.y }], zn = 7, zdx = e.x2 - e.x, zdy = e.y2 - e.y, zl = Math.hypot(zdx, zdy) || 1;
        for (k = 1; k < zn; k++) { var f = k / zn, off = (Math.random() - 0.5) * 26; zp.push({ x: e.x + zdx * f + (-zdy / zl) * off, y: e.y + zdy * f + (zdx / zl) * off }); }
        zp.push({ x: e.x2, y: e.y2 }); bolts.push({ pts: zp, life: 0.35 }); sound.zap(e.x2);
      } else if (e.type === 'beam') {
        hbeams.push({ y: e.y, life: 0.45 }); flash = Math.max(flash, 0.25);
      } else if (e.type === 'net') {
        sound.net(e.x); rings.push({ x: e.x, y: e.y, r: 90, t: 0, c: '#5ed8ff', lw: 4 });
        texts.push({ x: e.x, y: e.y - 40, vy: -50, life: 1.1, max: 1.1, s: obT('Gerettet!'), c: '#8fe6ff', size: 18 });
      } else if (e.type === 'won') {
        flash = 1; flashC = '255,200,120'; sound.won();
        if (!game.practice && game.level >= 1) { if (game.hasNextLevel()) saveProgress(game.level + 1, game.score); else clearProgress(); }
        showEnd();
      } else if (e.type === 'lost') {
        sound.lost(); showEnd();
      }
    }
    if (texts.length > 70) texts.splice(0, texts.length - 70);
    if (parts.length > 500) parts.splice(0, parts.length - 500);
  }
  function tickEffects(dt) {
    texts.forEach(function (t) { t.y += t.vy * dt; t.life -= dt; });
    texts = texts.filter(function (t) { return t.life > 0; });
    parts.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.life -= dt; });
    parts = parts.filter(function (p) { return p.life > 0; });
    rings.forEach(function (r) { r.t += dt; });
    rings = rings.filter(function (r) { return r.t < 0.5; });
    bolts.forEach(function (b) { b.life -= dt; }); bolts = bolts.filter(function (b) { return b.life > 0; });
    hbeams.forEach(function (b) { b.life -= dt; }); hbeams = hbeams.filter(function (b) { return b.life > 0; });
    if (flash > 0) flash = Math.max(0, flash - dt * 1.6); else flashC = '255,200,120';
    if (shake > 0) shake = Math.max(0, shake - dt); else shakeA = 0;   // PR5
    if (laserT > 0) laserT = Math.max(0, laserT - dt);
    if (catchT > 0) catchT = Math.max(0, catchT - dt);
    if (bannerT > 0) bannerT = Math.max(0, bannerT - dt);
    for (var id in bumpT) { bumpT[id] -= dt; if (bumpT[id] <= 0) delete bumpT[id]; }
    game.balls.forEach(function (b) { var tr = b.trail || (b.trail = []); tr.push({ x: b.x, y: b.y }); if (tr.length > 16) tr.shift(); });
  }

  /* --- Anzeige oben --- */
  var shown = {};
  function setStat(k, v) {
    if (shown[k] === v) return;
    shown[k] = v; var b = statEls[k], m = k === 'level' && /^(\d+)(\/\d+)$/.exec(v);
    if (m) { b.textContent = m[1]; b.appendChild(el('span', 'ob-of', m[2])); } else b.textContent = obT(v);
    if (k === 'level' || k === 'score') fitStat(b);
  }
  function fitStat(b) {                                              // Level-Zahl nie abschneiden: Schrift schrumpft, bis sie in die Box passt
    b.style.fontSize = ''; if (!b.clientWidth) return;
    var fs = parseFloat(win.getComputedStyle(b).fontSize) || 16;
    for (var i = 0; i < 12 && b.scrollWidth > b.clientWidth + 0.5 && fs > 7; i++) { fs *= 0.9; b.style.fontSize = fs.toFixed(1) + 'px'; }
  }
  function updateHud() {
    setStat('score', fmtScore(game.score));
    setStat('balls', String(game.ballsLeft) + (game.volley ? ' · Salve' : ''));
    setStat('targets', (game.targetsTotal - game.targetsLeft) + ' / ' + game.targetsTotal);
    setStat('mult', 'x' + (game.status === 'flying' ? game.multiplier() : 1));
    setStat('combo', game.status === 'flying' ? String(game.shotHits) : (game.bestCombo ? tt('Beste ', 'Best ') + game.bestCombo : '–'));
    setStat('level', game.practice ? String(game.level || 'Zufall') : (game.level + '/' + LEVELS.length));
    statEls.level.__lbl.textContent = obT(game.practice ? 'Übung' : 'Level');   // OB5: „Übung 100“ passt nicht in die Box
  }

  /* --- Meldungen (Level geschafft, Ende, Pause) --- */
  function hideMsg() { msg.classList.remove('ob-show'); msg.textContent = ''; }
  function resetFx() { texts = []; parts = []; rings = []; bolts = []; hbeams = []; flash = 0; shake = 0; shakeA = 0; shown = {}; newRank = 0; beamPts = null; laserT = 0; catchT = 0; bumpT = {}; renderScores(0); bannerT = 3.2; updateHud(); }
  /* --- Spielstand der Kampagne --- */
  var progress = Progress.load(store, progKey);
  var best = {}; try { best = JSON.parse(store.getItem(opts.bestKey || BEST_KEY) || '{}') || {}; } catch (e) { best = {}; }
  function renderLv() {
    lvCells.forEach(function (b) {
      var n = +b.dataset.lv, l = LEVELS[n - 1]; if (!l) { b.title = obT('Zufälliges Feld'); return; }
      b.classList.toggle('ob-lv-done', !!best[n]); b.classList.toggle('ob-lv-cur', !!(progress && progress.level === n));
      b.title = 'Level ' + n + ' · ' + obLvName(l.name) + '\n' + obLvDesc(l.desc) + (best[n] ? tt('\nBestwert: ', '\nBest: ') + fmtScore(best[n]) : '');
    });
  }
  function saveBest(n, pts) { if (!(n >= 1) || !(pts > (best[n] || 0))) return; best[n] = Math.floor(pts); try { store.setItem(opts.bestKey || BEST_KEY, JSON.stringify(best)); } catch (e) { } renderLv(); }
  function updateContinue() {
    btnContinue.style.display = progress ? '' : 'none';
    if (progress) btnContinue.textContent = tt('Weiterspielen: Level ', 'Continue: level ') + progress.level + ' (' + fmtScore(progress.score) + ')';
    btnNew.classList.toggle('ob-primary', !progress);
    if (typeof renderLv === 'function') renderLv();
  }
  function saveProgress(level, score) { if (Progress.save(store, progKey, level, score)) progress = { level: level, score: Math.floor(score) }; updateContinue(); }
  function clearProgress() { Progress.clear(store, progKey); progress = null; updateContinue(); }
  function continueCampaign() { if (!progress) return; hideMsg(); setPausedSilent(false); game.resumeCampaign(progress.level, progress.score); resetFx(); sound.intro(); }
  function startCampaign() { hideMsg(); setPausedSilent(false); game.reset(undefined, 1); resetFx(); sound.intro(); }
  function startPractice(n) { hideMsg(); setPausedSilent(false); game.reset(n ? undefined : undefined, n); game.practice = true; resetFx(); levelFx(); }
  function nextLevel() { hideMsg(); if (game.practice) { var n = game.level + 1; if (n <= LEVELS.length) startPractice(n); return; } game.nextLevel(); resetFx(); levelFx(); }
  function restartLevel() { hideMsg(); setPausedSilent(false); game.restartLevel(); resetFx(); }
  function setPausedSilent(p) { paused = p; btnPause.textContent = obT(p ? 'Weiter' : 'Pause'); }

  function showEnd(forceEntry) {
    var won = game.status === 'won', mode;
    if (game.practice) mode = 'practice';
    else if (won && game.hasNextLevel() && !forceEntry) mode = 'next';
    else mode = 'final';
    entered = false; msg.textContent = '';
    var card = el('div', 'ob-card'), row = el('div', 'ob-row'), status = el('p'), input = null, btnSave = null;
    function btn(label, primary, fn) { var b = el('button', 'ob-btn' + (primary ? ' ob-primary' : ''), label); b.type = 'button'; b.addEventListener('click', fn); row.appendChild(b); return b; }
    var levelPts = game.score - game.levelStartScore;
    if (won) saveBest(game.level, levelPts);
    if (won && game.level >= 1) wwSend({ l: game.level, s: Math.floor(levelPts), ms: Math.round(game.time * 1000) });   // PQ7: bester Wert je Level (auch Übung)
    if (mode === 'final' && game.score > 0) wwSend({ l: 0, s: Math.floor(game.score), lv: game.levelsCleared });         // PQ7: Kampagne
    if (mode === 'practice') {
      card.appendChild(el('h2', null, won ? 'Übung geschafft' : 'Übung vorbei'));
      card.appendChild(el('div', 'ob-big', fmtScore(game.score)));
      card.appendChild(el('p', null, won ? tt('Restdrohnen-Bonus: +', 'Leftover drone bonus: +') + fmtScore(game.bonus) : tt('Noch ' + game.targetsLeft + ' von ' + game.targetsTotal + ' Erzadern übrig.', game.targetsLeft + ' of ' + game.targetsTotal + ' ore veins left.')));
      card.appendChild(el('p', null, 'Übungsmodus: kein Highscore-Eintrag.'));
      btn('Nochmal', true, restartLevel);
      if (won && game.level >= 1 && game.level < LEVELS.length) btn('Nächstes Level (Übung)', false, nextLevel);
      btn('Neue Kampagne', false, startCampaign);
    } else if (mode === 'next') {
      var nx = LEVELS[game.level];
      card.appendChild(el('h2', null, tt('Level ' + game.level + ' geräumt!', 'Level ' + game.level + ' cleared!')));
      card.appendChild(el('div', 'ob-big', fmtScore(game.score)));
      card.appendChild(el('p', null, tt('Level-Punkte: +', 'Level points: +') + fmtScore(levelPts) + tt(' (Restdrohnen-Bonus +', ' (leftover drone bonus +') + fmtScore(game.bonus) + (game.comboTotal ? tt(', Combo-Bonus +', ', combo bonus +') + fmtScore(game.comboTotal) : '') + ')'));
      if (game.bestCombo >= CFG.comboMin) card.appendChild(el('p', null, tt('Beste Combo: ' + game.bestCombo + ' Treffer', 'Best combo: ' + game.bestCombo + ' hits')));
      card.appendChild(el('p', null, tt('Als Nächstes: Level ', 'Next up: level ') + (game.level + 1) + ' · ' + obLvName(nx.name)));
      btn(tt('Weiter: Level ', 'Next: level ') + (game.level + 1), true, nextLevel);
      btn('Punkte jetzt eintragen', false, function () { showEnd(true); });
    } else {
      var done = won && game.level === LEVELS.length;
      card.appendChild(el('h2', null, done ? 'Kampagne abgeschlossen!' : (won ? 'Kampagne beendet' : 'Game over')));
      card.appendChild(el('div', 'ob-big', fmtScore(game.score)));
      card.appendChild(el('p', null, tt(game.levelsCleared + ' von ' + LEVELS.length + ' Leveln geräumt' + (won ? '' : ' · Level ' + game.level + ': noch ' + game.targetsLeft + ' Erzadern übrig'), game.levelsCleared + ' of ' + LEVELS.length + ' levels cleared' + (won ? '' : ' · level ' + game.level + ': ' + game.targetsLeft + ' ore veins left'))));
      var can = Highscores.qualifies(scores, game.score);
      if (can) {
        status.textContent = obT('Top-10-Platz! Trag deinen Namen ein:'); status.className = 'ob-ok';
        input = el('input'); input.type = 'text'; input.maxLength = 24; input.setAttribute('aria-label', obT('Name für den Highscore'));
        var nm = ''; try { nm = store.getItem(nameKey) || ''; } catch (e) { }
        input.value = nm || defaultName;
        btnSave = el('button', 'ob-btn ob-primary', 'Eintragen'); btnSave.type = 'button';
      } else status.textContent = game.score > 0 ? obT('Diesmal kein Top-10-Platz.') : '';
      card.appendChild(status);
      if (input) card.appendChild(input);
      if (btnSave) row.appendChild(btnSave);
      btn('Neue Kampagne', !can, startCampaign);
      if (!won) btn('Level neu versuchen', false, restartLevel);
      var doSave = function () {
        if (entered || !input) return;
        entered = true;
        var name = Highscores.cleanName(input.value);
        try { store.setItem(nameKey, name); } catch (e) { }
        var res = Highscores.add(scores, { name: name, score: game.score, lvl: game.levelsCleared, won: done, date: new Date().toISOString() });
        scores = res.list; Highscores.save(store, hsKey, scores); newRank = res.rank; renderScores(res.rank);
        status.textContent = res.rank ? tt('Gespeichert: Platz ' + res.rank + ' von ' + HS_MAX + '.', 'Saved: rank ' + res.rank + ' of ' + HS_MAX + '.') : obT('Gespeichert.');
        input.style.display = 'none'; btnSave.style.display = 'none'; btnSave.disabled = true;
        if (opts.onScore) { try { opts.onScore(res.entry, res.rank); } catch (e) { } }
      };
      if (btnSave) {
        doSave = obField(doSave); btnSave.addEventListener('click', doSave);   // Ergebniskarte im Feld: Englisch
        input.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter') doSave(); });
        setTimeout(function () { try { input.focus(); input.select(); } catch (e) { } }, 30);
      }
    }
    card.appendChild(row);
    msg.appendChild(card); msg.classList.add('ob-show');
  }
  function showPause() {
    msg.textContent = '';
    var card = el('div', 'ob-card'); card.appendChild(el('h2', null, 'Pause')); card.appendChild(el('p', null, 'Klicken, Leertaste oder P zum Weiterspielen.'));
    msg.appendChild(card); msg.classList.add('ob-show');
  }
  function setPaused(p) {
    if (p === paused || game.status === 'won' || game.status === 'lost') return;
    setPausedSilent(p);
    if (p) showPause(); else hideMsg();
  }

  /* --- Eingabe --- */
  function pos(e) {
    var r = canvas.getBoundingClientRect();
    var cw = canvas.clientWidth || r.width, ch = canvas.clientHeight || r.height;   // ohne Rahmen
    return { x: (e.clientX - r.left - canvas.clientLeft) / cw * W, y: (e.clientY - r.top - canvas.clientTop) / ch * H };
  }
  var dragging = false;
  function onMove(e) { if (paused) return; var p = pos(e); game.aimAt(p.x, p.y); }
  function onDown(e) {
    try { rootEl.focus({ preventScroll: true }); } catch (x) { }
    if (paused) { setPaused(false); return; }
    var p = pos(e); game.aimAt(p.x, p.y);
    if (e.pointerType === 'mouse') { if (e.button === 0) game.fire(); }
    else { dragging = true; try { canvas.setPointerCapture(e.pointerId); } catch (x) { } }
  }
  function onUp(e) { if (dragging && e.pointerType !== 'mouse') { dragging = false; if (!paused) game.fire(); } }
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', function () { dragging = false; });
  msg.addEventListener('click', function (e) { if (paused && e.target.closest && !e.target.closest('.ob-card button')) setPaused(false); });
  function onKey(e) {
    sound.resume();
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')) return;
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight') {
      if (!paused && game.status === 'aiming') { game.aimPoint = null; game.setAim(game.aim + (k === 'ArrowRight' ? 0.03 : -0.03)); e.preventDefault(); }
    } else if (k === ' ' || k === 'Enter') {
      if (paused) setPaused(false); else if (game.status === 'aiming') game.fire();
      e.preventDefault();
    } else if (k === 'p' || k === 'P') { setPaused(!paused); e.preventDefault(); }
    else if (k === 'm' || k === 'M') { sound.resume(); sound.toggle(); syncSoundBtn(); e.preventDefault(); }
  }
  function syncSoundBtn() { btnSound.textContent = obT(sound.enabled() ? 'Ton: an' : 'Ton: aus'); btnSound.setAttribute('aria-pressed', sound.enabled() ? 'true' : 'false'); }
  btnSound.addEventListener('click', function () { sound.resume(); sound.toggle(); syncSoundBtn(); if (sound.enabled()) sound.hit({ t: 'z' }, 3); });
  syncSoundBtn();
  rootEl.addEventListener('keydown', onKey);
  rootEl.addEventListener('pointerdown', function () { sound.resume(); }, true);
  btnNew.addEventListener('click', function () { startCampaign(); });
  btnContinue.addEventListener('click', function () { continueCampaign(); });
  updateContinue();
  btnRestart.addEventListener('click', function () { restartLevel(); });
  lvGrid.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.ob-lv-c'); if (b) startPractice(parseInt(b.dataset.lv, 10)); });
  btnPause.addEventListener('click', function () { setPaused(!paused); });
  btnClear.addEventListener('click', function () {
    if (!scores.length) return;
    if (win.confirm(obT('Den OmniBreaker-Highscore wirklich leeren?'))) { scores = []; Highscores.save(store, hsKey, scores); renderScores(0); }
  });
  function onVis() { if (document.hidden) setPaused(true); }
  document.addEventListener('visibilitychange', onVis);

  draw = obField(draw); handleEvents = obField(handleEvents); updateHud = obField(updateHud); showEnd = obField(showEnd); showPause = obField(showPause);   // Spielfeld immer Englisch
  renderLv = obMenu(renderLv); renderScores = obMenu(renderScores); updateContinue = obMenu(updateContinue); setPausedSilent = obMenu(setPausedSilent); wwSend = obMenu(wwSend);   // Menü bleibt in der Programmsprache

  /* --- Hauptschleife --- */
  function loop(ts) {
    if (destroyed) return;
    raf = win.requestAnimationFrame(loop);
    var dt = last ? (ts - last) / 1000 : 0; last = ts;
    if (!paused) { game.update(dt); handleEvents(); tickEffects(dt); }
    updateHud();
    draw(ts / 1000);
  }

  resize(); renderScores(0); updateHud(); bannerT = 3.2;
  raf = win.requestAnimationFrame(loop);

  return {
    game: game,
    sound: sound,
    startCampaign: startCampaign,
    startPractice: startPractice,
    nextLevel: nextLevel,
    restartLevel: restartLevel,
    restart: startCampaign,
    intro: function () { sound.resume(); sound.intro(); },
    pause: function () { setPaused(true); },
    resume: function () { setPaused(false); },
    isPaused: function () { return paused; },
    scores: function () { return scores.slice(); },
    destroy: function () {
      destroyed = true; win.cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else win.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      if (rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
    }
  };
}

root.OmniBreaker = {
  version: '3.3',
  CFG: CFG, LEVELS: LEVELS, POWER_NAMES: POWER_NAMES, t: obT, en: OB_EN, lvName: obLvName, lvDesc: obLvDesc, Game: Game, Highscores: Highscores, Progress: Progress, createSound: createSound,
  makeLayout: makeLayout, buildLevel: buildLevel, buildLane: buildLane, obLaneDef: obLaneDef, fmtScore: fmtScore, mount: mount
};

/* Alleinstehende Datei: automatisch ins Feld #omnibreaker setzen */
if (typeof document !== 'undefined') {
  var start = function () {
    var host = document.getElementById('omnibreaker');
    if (host && !host.hasAttribute('data-ob-manual')) root.omnibreakerInstance = mount(host);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
})(typeof globalThis !== 'undefined' ? globalThis : window);
/* ===== OMNIBREAKER-SCRIPT-END ===== */

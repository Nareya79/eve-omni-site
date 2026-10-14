/* AUTOMATISCH ERZEUGT von tools/omnibreaker-sync.py aus OmniBreaker/OmniBreaker.html – NICHT von Hand ändern. */
/* ===== OMNIBREAKER-SCRIPT-START =====
   OmniBreaker 4.0 (13.10.2026): Feld 720 × 1280 (Hochformat 9:16), 150 handgebaute Level, Steinbahnen, Gleiter, 26 Items. Quelle: OmniBreaker/OmniBreaker.html
   (Desktop-Block in EVE-Omni.html und Handy m/ob-game.* kommen per tools/omnibreaker-sync.py von hier).
   Alles steckt in einem abgeschlossenen Block und legt nur EIN Objekt an: window.OmniBreaker.
   Browser-Speicher (nie umbenennen): eve-zentrale-omnibreaker-highscores, -name, -sound(-vol), -progress (Spielstand), -best (Bestwert je Level), -bg, -online, -online-char, -vibrate;
   <progress>-v4 = Merker, dass der alte Spielstand (anderes Level-Set) einmal zurückgesetzt wurde.
   Kein Netzwerk, kein ESI, keine Eingaben ans Spiel EVE. */
(function (root) {
'use strict';

/* ---------- Einstellungen ---------- */
var CFG = {
  W: 720, H: 1280,
  ballR: 7.2, pegR: 10.8,   // PQ5: alle Teile 10 % kleiner = mehr Platz und größere Lücken
  gravity: 1300, launchSpeed: 950, restPeg: 0.75, restWall: 0.85, maxSpeed: 1650,   // OB2: höheres Feld – typischer Schuss ~14 % länger unterwegs, freier Fall ~3 %
  sub: 1 / 300,                                                    // OB2: je Rechenschritt weniger als die halbe Steindicke (1650/300 = 5,5 px)
  balls: 10, pegCount: 120, targets: 22, bonusPegs: 1, greenPegs: 2, boomR: 110,
  pts: { n: 10, z: 100, b: 500, g: 50 },
  catchPts: 250, restBonus: 1000, multEvery: 6, multMax: 8,
  aimMax: 1.35, launcherX: 360, launcherY: 52, muzzle: 34,
  bucketW: 108, bucketY: 1252, bucketSpeed: 150,                   // Frachter bei H − 28
  stuckCheck: 1.0, stuckDist: 14, shotMax: 30,
  wreckR: 18, restWreck: 1.05, gateR: 20, gateTrigger: 14, gateCd: 0.6,
  swarmMax: 6, plasmaHits: 6, tractorK: 6, tractorMax: 900, tractorMinY: 640,
  volleySpread: 0.13,
  comboMin: 5, comboStep: 5, comboK: 10,
  wellMinD: 4, chainN: 6, laserBand: 18, megaScale: 1.7, netSpeed: 940, netMax: 2,
  railHalf: 4, railRest: 0.92, railSpeed: 980, railAcc: 1600, railCd: 0.5, railRides: 3,   // PQ4: Rampen (Abprall) + Beschleunigerbahnen (Drohne fährt mit)
  restHull: 0.55, hullPush: 110,   // PT1: Frachter-Rumpf neben dem Laderaum – mittlerer Rückprall, flach liegende Drohne rollt nach außen
  stoneHalf: 6.5, stoneLen: 26, stoneStep: 22, stoneRest: 0.2, stoneFric: 0.08, stoneVMax: 120, stoneCell: 48,   // Steinbahn: Dicke/Länge, Rückprall, Reibung (Anteil je Sekunde Rollen), Höchsttempo bewegter Bahnen, Raster
  top: 170, bot: 1170,                                             // Spielzone der Brocken (y); x 40 … W − 40
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
  'Rampe: die Drohne prallt ab': 'Ramp: the drone bounces off', 'Beschleunigerbahn: die Drohne fährt mit und wird am Ende rausgeschossen': 'Accelerator rail: the drone rides along and is fired out at the end',
  ' · Übung (kein Highscore)': ' · practice (no high score)', 'Übungsmodus: Level wählen': 'Practice mode: pick a level',
  'Charakter für die Bestenliste': 'Character for the leaderboard', 'Vibration': 'Vibration', 'Vibration bei Combo und Gleiter (Handy)': 'Vibration on combo and slide (phone)',
  'Zielscanner': 'Target scanner', 'Phantom-Drohne': 'Phantom drone', 'Gleitschub': 'Slide booster', 'Felsbrecher': 'Rock breaker', 'Sprung-Drohne': 'Jump drone',
  'Wiederbelebung': 'Revival', 'Frostschlag': 'Frost strike', 'Überladung': 'Overload',
  'zeigt 3 Schüsse lang die Flugbahn nach dem ersten Abprall': 'shows the path after the first bounce for 3 shots',
  'graue Brocken werden durchfliegbar, verbrauchte kehren als Geister zurück': 'grey rocks become passable, used ones return as ghosts',
  'Drohne haftet länger auf Bahnen, Gleiter-Punkte ×2': 'drone sticks to rails longer, slide points ×2',
  'riesiger Fels zerschlägt alles auf dem Weg, kostet keine Drohne': 'a huge rock smashes everything in its path, costs no drone',
  'Drohne springt auf eine Erzader und trifft sie': 'drone jumps onto an ore vein and hits it', '6 verbrauchte graue Brocken kehren zurück': '6 used grey rocks come back',
  'getroffene Brocken rutschen weg und stoßen andere an': 'rocks that are hit slide away and knock into others', 'jeder Treffer aktiviert die 2 nächsten Brocken mit': 'every hit also triggers the 2 nearest rocks'
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
  'Tore': 'gates', 'Steinbahn': 'stone rail', 'bewegte Steinbahn': 'moving stone rail', 'Rampen': 'ramps', 'Beschleunigerbahnen': 'accelerator rails', 'Wracks': 'wrecks', 'fahrende Wracks': 'moving wrecks', 'Schwerkraftfelder': 'gravity fields', 'wandernde Felder': 'wandering fields', 'ruhendes Feld': 'resting field',
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
var ONLINE_CHAR_KEY = 'eve-zentrale-omnibreaker-online-char';   // gewählter Charakter für die weltweite Bestenliste (cid)
var ONLINE_KEY = 'eve-zentrale-omnibreaker-online';   // PQ7: '1' = Punkte in die weltweite Bestenliste hochladen (Standard an, '0' = aus)
var BEST_KEY = 'eve-zentrale-omnibreaker-best';
var VIBE_KEY = 'eve-zentrale-omnibreaker-vibrate';   // kurze Vibration bei Combo/Gleiter (Handy), Standard aus
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
/* OB2 1b: 8 neue Items (Werte und Namen eigene, EVE-Sprache) */
POWER_NAMES.trace = 'Zielscanner'; POWER_NAMES.phantom = 'Phantom-Drohne'; POWER_NAMES.slideboost = 'Gleitschub'; POWER_NAMES.rockfall = 'Felsbrecher';
POWER_NAMES.jump = 'Sprung-Drohne'; POWER_NAMES.revive = 'Wiederbelebung'; POWER_NAMES.frost = 'Frostschlag'; POWER_NAMES.overload = 'Überladung';
POWER_INFO.trace = 'zeigt 3 Schüsse lang die Flugbahn nach dem ersten Abprall'; POWER_INFO.phantom = 'graue Brocken werden durchfliegbar, verbrauchte kehren als Geister zurück';
POWER_INFO.slideboost = 'Drohne haftet länger auf Bahnen, Gleiter-Punkte ×2'; POWER_INFO.rockfall = 'riesiger Fels zerschlägt alles auf dem Weg, kostet keine Drohne';
POWER_INFO.jump = 'Drohne springt auf eine Erzader und trifft sie'; POWER_INFO.revive = '6 verbrauchte graue Brocken kehren zurück';
POWER_INFO.frost = 'getroffene Brocken rutschen weg und stoßen andere an'; POWER_INFO.overload = 'jeder Treffer aktiviert die 2 nächsten Brocken mit';
/* Freischalt-Plan OB2: pro Welt ein neues Item, nie zwei im selben Level (Welt 1: zwei kleine Helfer) */
var POWER_UNLOCK = { trace: 5, slideboost: 8, stasis: 15, magnet: 23, double: 34, drill: 44, slowmo: 54, warp: 64, gravity: 74, split: 84,
  revive: 94, phantom: 103, frost: 114, overload: 124, jump: 134, rockfall: 144 };

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

/* ---- Bewegung (für Brocken, Wracks, Tore, Felder und Steinbahnen) ----
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
var OB_POWERS = ['bomb', 'swarm', 'plasma', 'tractor', 'extra', 'volley', 'chain', 'laser', 'shield', 'mega'];
/* Items je Level: je höher, desto mehr (OB3 hängt hier neue Items nach Stufe an) */
function obNewAt(L) { return Object.keys(POWER_UNLOCK).filter(function (k) { return POWER_UNLOCK[k] <= L; }); }
function obPowersFor(L, rnd, n) {
  var fresh = Object.keys(POWER_UNLOCK).filter(function (k) { return POWER_UNLOCK[k] === L; });
  var newer = shuffle(obNewAt(L).filter(function (k) { return fresh.indexOf(k) < 0; }), rnd), old = shuffle(OB_POWERS.slice(), rnd);
  var take = Math.min(newer.length, Math.ceil(n / 2)), out = fresh.concat(newer.slice(0, take));   // je höher, desto mehr neue
  return out.concat(old.slice(0, Math.max(0, n - out.length)));
}

/* Handgebaute Level: Nummer → { name, en, desc, descEn, scene: [Szene, Farbton], balls, items, build(K) → { pegs, stoneRails, wrecks, gatePairs, wells, ramps, tracks } }.
   Nichts wird automatisch verschoben oder entfernt – Fehler meldet die Fairness-Prüfung (tests/fairness.test.js). */
var OB2_LEVELS = {
  /* ===== Welt 1 – Einsteiger-Gürtel: ruhige Formen, erste Steinbahnen, Gleiter ===== */
  1: { name: 'Erster Schuss', en: 'First Shot', desc: 'Eine Reihe, ein V und eine Schale', descEn: 'A row, a V and a bowl', scene: ['sun', 40], items: ['bomb', 'extra'],
    build: function (K) {
      var row = K.z(K.row(120, 330, 600, 330, 11), [1, 3, 5, 7, 9]); K.g(row, [0]);
      var v = K.sym(K.z(K.row(140, 470, 320, 710, 5), [4]));
      var bowl = K.z(K.arc(360, 600, 440, Math.PI / 2 + 0.62, Math.PI / 2 - 0.62, 13), [0, 4, 8, 12]); K.b(bowl, [6]);
      var nest = K.z(K.g(K.ring(360, 560, 52, 6), [0]), [3]);
      return { pegs: K.tidy(K.join(row, v, bowl, nest)) };
    } },
  2: { name: 'Die Treppe', en: 'The Staircase', desc: 'Stufen nach rechts unten, ein Bogen dagegen', descEn: 'Steps down to the right, an arc against them', scene: ['deep', 200], items: ['bomb', 'extra'],
    build: function (K) {
      var steps = []; for (var i = 0; i < 6; i++) steps = steps.concat(K.z(K.row(80 + i * 92, 290 + i * 118, 172 + i * 92, 290 + i * 118, 3), [1]));
      var arc = K.z(K.arc(80, 1180, 430, -1.4, -0.12, 12), [2, 4, 6, 10]); K.g(arc, [8]);
      var gem = K.z(K.diamond(560, 320, 130, 120, 44), [0]); K.b(gem, [4]); K.g(gem, [2]);
      var dots = K.z(K.row(110, 600, 110, 840, 5), [2]);
      return { pegs: K.tidy(K.join(steps, arc, gem, dots)) };
    } },
  3: { name: 'Die Kuppel', en: 'The Dome', desc: 'Eine Steinkuppel, darüber drei Bögen', descEn: 'A stone dome under three arcs', scene: ['nebula', 205], items: ['bomb', 'extra'],
    build: function (K) {
      var cx = 360, cy = 931, R = 236, U = -Math.PI / 2;
      var a1 = K.z(K.arc(cx, cy, R + 75, U - 0.62, U + 0.62, 9), [0, -1]), a2 = K.z(K.arc(cx, cy, R + 140, U - 0.56, U + 0.56, 11), [0, 5, -1]), a3 = K.z(K.arc(cx, cy, R + 205, U - 0.5, U + 0.5, 12), [2, -3]);
      K.g(a1, [4]); K.b(a3, [5]);
      var top = K.z(K.wave(90, 630, 290, 24, 2, 13), [2, 6, 10]); K.g(top, [4]);
      var gem = K.diamond(360, 400, 150, 84, 44);
      var fun = K.sym(K.z(K.row(78, 880, 210, 1090, 5), [-1]));
      var nest = K.ring(360, 985, 52, 7);
      var rails = [K.rail('arc', 360, 760, { w: 420, z: 3, g: 0 })];
      return { pegs: K.tidy(K.join(a1, a2, a3, top, gem, fun, nest), rails), stoneRails: rails };
    } },
  4: { name: 'Gegenwellen', en: 'Counter Waves', desc: 'Zwei Wellen laufen gegeneinander', descEn: 'Two waves run against each other', scene: ['nebula', 290], items: ['bomb', 'swarm'],
    build: function (K) {
      var top = K.z(K.row(220, 270, 500, 270, 7), [3]);
      var w1 = K.z(K.wave(70, 650, 430, 52, 1.5, 15), [2, 7, 12]), w2 = K.z(K.wave(70, 650, 580, 52, 1.5, 15, Math.PI), [2, 7, 12]);
      K.g(w1, [4]); K.b(w2, [9]);
      var r1 = K.z(K.ring(190, 850, 60, 7), [0]), r2 = K.z(K.ring(530, 850, 60, 7), [0]); K.g(r2, [3]);
      var bot = K.z(K.row(130, 1070, 590, 1070, 10), [1, 5, 8]);
      return { pegs: K.tidy(K.join(top, w1, w2, r1, r2, bot)) };
    } },
  5: { name: 'Die Raute', en: 'The Rhombus', desc: 'Raute in der Raute', descEn: 'A rhombus inside a rhombus', scene: ['planet', 140], items: ['bomb'],
    build: function (K) {
      var outer = K.diamond(360, 620, 520, 700, 46), inner = K.diamond(360, 620, 240, 330, 44);
      K.z(outer, function (i, p) { return Math.abs(p.x - 360) < 2 || Math.abs(p.y - 620) < 2; }); K.z(inner, function (i, p) { return Math.abs(p.y - 620) < 2; });
      K.g(outer, [3]); K.g(inner, [2]); K.b(outer, [-3]);
      var heart = K.z([{ x: 360, y: 620 }], [0]);
      var crown = K.z(K.arc(360, 420, 330, -Math.PI / 2 - 0.85, -Math.PI / 2 + 0.85, 13), [0, 3, 6, 9, 12]);
      var feet = K.sym(K.z(K.row(70, 1080, 230, 1080, 4), [0]));
      return { pegs: K.tidy(K.join(heart, inner, outer, crown, feet)) };
    } },
  6: { name: 'Lange Welle', en: 'Long Wave', desc: 'Eine Steinwelle zum Gleiten', descEn: 'A stone wave to slide along', scene: ['moon', 60], items: ['bomb', 'extra'],
    build: function (K) {
      var zig = K.z(K.path([[90, 260], [225, 340], [360, 260], [495, 340], [630, 260]], 46), [3, 6, 9]); K.g(zig, [0]);
      var cups = []; [170, 360, 550].forEach(function (x, i) { cups = cups.concat(K.z(K.arc(x, 400, 80, Math.PI / 2 + 1.05, Math.PI / 2 - 1.05, 5), [2])); });
      var roof = K.sym(K.z(K.row(100, 1060, 320, 900, 6), [5, 2])); K.b(roof, [0]);
      var keel = K.z(K.row(360, 960, 360, 1120, 4), [3]); K.g(keel, [1]);
      var rails = [K.rail('wave', 360, 690, { w: 540, amp: 42, waves: 2, ph: 0, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(zig, cups, roof, keel), rails), stoneRails: rails };
    } },
  7: { name: 'Der Pfeil', en: 'The Arrow', desc: 'Ein Pfeil zielt nach links unten', descEn: 'An arrow pointing down-left', scene: ['comet', 20], items: ['swarm', 'bomb'],
    build: function (K) {
      var shaft = K.z(K.row(610, 280, 250, 790, 13), [0, 4, 8]);
      var head = K.join(K.row(190, 870, 190, 690, 5), K.row(235, 870, 370, 870, 4));
      K.z(head, [0, 4, 8]); K.g(head, [2]);
      var comb = K.z(K.grid(90, 270, 4, 3, 48, 42, true), [1, 5, 9]);
      var right = K.z(K.arc(700, 980, 230, Math.PI + 0.15, Math.PI + 1.2, 7), [1, 5]); K.b(right, [3]);
      var tail = K.z(K.g(K.row(470, 1110, 650, 1110, 5), [2]), [0, 4]);
      return { pegs: K.tidy(K.join(shaft, head, comb, right, tail)) };
    } },
  8: { name: 'Doppelschanze', en: 'Twin Ramps', desc: 'Zwei Steinschanzen werfen die Drohne quer', descEn: 'Two stone ramps fling the drone across', scene: ['gasgiant', 330], items: ['bomb'],
    build: function (K) {
      var dome = K.z(K.arc(360, 560, 330, -Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9, 13), [1, 6, 11]); K.g(dome, [3]);
      var col = K.z(K.row(640, 420, 640, 720, 7), [3]);
      var ring = K.z(K.ring(360, 1020, 82, 9, 0.4), [2, 6]); K.b(ring, [4]);
      var mid = K.z(K.row(300, 680, 420, 680, 3), [1]);
      var low = K.z(K.row(80, 760, 80, 1000, 6), [5]); K.g(low, [2]);
      var rails = [K.rail('jump', 210, 560, { w: 190, z: 2, g: 0 }), K.rail('jump', 500, 820, { w: 190, flip: true, z: 2, g: 1 })];
      return { pegs: K.tidy(K.join(dome, col, ring, mid, low), rails), stoneRails: rails };
    } },
  9: { name: 'Spiralnebel', en: 'Spiral Nebula', desc: 'Zwei Spiralarme in einem Ring', descEn: 'Two spiral arms inside a ring', scene: ['galaxy', 250], items: ['bomb', 'extra', 'swarm'],
    build: function (K) {
      var a1 = K.z(K.spiral(360, 640, 44, 118, 1.6, 46, 0), [-1, 5]), a2 = K.z(K.spiral(360, 640, 44, 118, 1.6, 46, Math.PI), [-1, 5]);
      K.g(a1, [2]); K.g(a2, [2]);
      var ring = K.z(K.ring(360, 640, 300, 38, 0.32), function (i) { return i % 6 === 3; }); K.b(ring, [17]);
      var top = K.g(K.row(220, 250, 500, 250, 7), [3]);
      var corners = K.z(K.join(K.ring(90, 1100, 40, 5), K.ring(630, 1100, 40, 5)), [0, 5]);
      return { pegs: K.tidy(K.join(a1, a2, ring, top, corners)) };
    } },
  10: { name: 'Erster Kontakt', en: 'First Contact', desc: 'Finale: zwei Ringe um ein Nest', descEn: 'Finale: two rings around a nest', scene: ['gate', 200], items: ['bomb', 'swarm', 'extra', 'volley'],
    build: function (K) {
      var c = [360, 680];
      var nest = K.z(K.join(K.ring(c[0], c[1], 52, 6), [{ x: c[0], y: c[1] }]), [0, 3, 6]);
      var r1 = K.z(K.ring(c[0], c[1], 150, 20, 0.45), [1, 5, 9, 13]); K.g(r1, [7]);
      var r2 = K.z(K.ring(c[0], c[1], 255, 32, 0.32), [2, 8, 14, 20, 26]); K.g(r2, [11, 17]); K.b(r2, [5]);
      var corners = []; [[110, 1070], [610, 1070]].forEach(function (p) { corners = corners.concat(K.z(K.diamond(p[0], p[1], 90, 90, 45), [0])); });
      var rails = [K.rail('arc', 360, 330, { w: 320, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(nest, r1, r2, corners), rails), stoneRails: rails };
    } },

  /* ===== Welt 2 – Erzfelder: Panzer-Brocken, Rampen, Schale ===== */
  11: { name: 'Panzerreihen', en: 'Armored Rows', desc: 'Reihen wie eine Vase, die Mitte gepanzert', descEn: 'Rows shaped like a vase, the middle is armored', scene: ['nebula', 35], items: ['bomb', 'laser'],
    build: function (K) {
      var widths = [150, 210, 250, 270, 250, 200, 140, 110], rows = [];
      widths.forEach(function (w, i) {
        var y = 290 + i * 100, n = Math.round(2 * w / 48) + 1, r = K.row(360 - w, y, 360 + w, y, n);
        K.z(r, [0, -1]); if (i >= 3 && i <= 4) K.armor(r, 2, function (k) { return k % 3 === 1; });
        rows = rows.concat(r);
      });
      K.g(rows, [6, 40]); K.b(rows, [25]);
      return { pegs: K.tidy(rows) };
    } },
  12: { name: 'Rampenlauf', en: 'Ramp Run', desc: 'Zwei Rampen und ein Keil aus Erz', descEn: 'Two ramps and a wedge of ore', scene: ['lava', 15], items: ['bomb', 'chain'],
    build: function (K) {
      var wedge = []; [7, 6, 5, 4, 3].forEach(function (n, i) { var w = (n - 1) * 24; wedge = wedge.concat(K.z(K.row(360 - w, 300 + i * 86, 360 + w, 300 + i * 86, n), n % 2 ? [Math.floor(n / 2)] : [0])); });
      K.armor(wedge, 2, [1, 5, 8]); K.g(wedge, [3]);
      var wings = K.sym(K.z(K.arc(120, 700, 120, -0.6, 1.3, 6), [0, 5]));
      var bot = K.z(K.wave(110, 610, 1040, 30, 1, 11), [1, 3, 5, 7, 9]); K.b(bot, [10]); K.g(bot, [0]);
      return { pegs: K.tidy(K.join(wedge, wings, bot)), ramps: [K.ramp(70, 860, 220, 920), K.ramp(650, 860, 500, 920)] };
    } },
  13: { name: 'Die Schale', en: 'The Bowl', desc: 'Eine Steinschale lenkt in die Mitte', descEn: 'A stone bowl funnels to the middle', scene: ['binary', 280], items: ['bomb', 'extra'],
    build: function (K) {
      var fruit = K.z(K.ring(360, 520, 90, 10), [0, 5]); K.armor(fruit, 2, [2, 7]); K.g(fruit, [3]);
      var core = K.z([{ x: 360, y: 520 }], [0]);
      var below = K.b(K.ring(360, 960, 60, 7), [0]);   // unter der Schale: Belohnung, keine Pflicht-Erzader
      var sides = K.sym(K.z(K.row(80, 330, 80, 1030, 15), [2, 6, 10])); K.armor(sides, 2, [4, 8]);
      var top = K.z(K.arc(360, 600, 380, -Math.PI / 2 - 0.62, -Math.PI / 2 + 0.62, 11), [0, 5, 10]); K.g(top, [2]);
      var rails = [K.rail('arc', 360, 770, { w: 440, rot: Math.PI, z: 4, g: 0 })];
      return { pegs: K.tidy(K.join(core, fruit, below, sides, top), rails), stoneRails: rails };
    } },
  14: { name: 'Die Erzader', en: 'The Ore Vein', desc: 'Eine schräge Ader, gepanzerte Ränder', descEn: 'A slanted vein with armored edges', scene: ['pulsar', 100], items: ['laser', 'bomb'],
    build: function (K) {
      var path = [[90, 300], [250, 470], [300, 690], [500, 860], [630, 1080]];
      var vein = K.z(K.path(path, 46), function (i) { return i % 2 === 0; });
      var up = K.armor(K.move(K.path(path, 46), 58, -40), 2, 2), dn = K.armor(K.move(K.path(path, 46), -58, 40), 2, 3);
      K.armor(up, 3, [4, 10]); K.g(dn, [6]);
      var nuggets = K.z(K.join(K.ring(560, 380, 50, 6), K.ring(150, 920, 50, 6)), [0, 6]); K.b(nuggets, [3]); K.g(nuggets, [9]);
      return { pegs: K.tidy(K.join(vein, up, dn, nuggets)) };
    } },
  15: { name: 'Sternschnuppe', en: 'Shooting Star', desc: 'Ein Stern mit langem Schweif', descEn: 'A star with a long tail', scene: ['comet', 200], items: ['bomb', 'laser'],
    build: function (K) {
      var star = K.z(K.star(300, 700, 230, 100, 5, 46), function (i, p) { return Math.hypot(p.x - 300, p.y - 700) > 220; }); K.armor(star, 2, function (i, p) { return Math.hypot(p.x - 300, p.y - 700) < 110; });
      var core = K.b(K.ring(300, 700, 46, 5), [0]); K.g(core, [2]);
      var tail = K.z(K.join(K.row(470, 520, 650, 270, 6), K.row(520, 560, 670, 360, 5)), [1, 3, 5, 7, 9]); K.g(tail, [0]);
      var dust = K.z(K.arc(300, 700, 330, 0.4, 1.4, 6), [1, 4]);
      return { pegs: K.tidy(K.join(star, core, tail, dust)) };
    } },
  16: { name: 'Zickzack', en: 'Zigzag', desc: 'Zickzack-Linien über einer Steinwelle', descEn: 'Zigzag lines above a stone wave', scene: ['nebula', 170], items: ['bomb', 'chain'],
    build: function (K) {
      var zz = []; [290, 450, 610].forEach(function (y, k) { var p = []; for (var i = 0; i < 7; i++) p.push([90 + i * 90, y + (i % 2 ? 60 : 0) * (k % 2 ? -1 : 1)]); zz = zz.concat(K.z(K.path(p, 45), [2 + k, 8, 13 - k])); });
      K.armor(zz, 2, function (i) { return i % 5 === 1; }); K.g(zz, [4, 20]); K.b(zz, [11]);
      var bot = K.z(K.row(150, 1080, 570, 1080, 9), [0, 4, 8]);
      var rails = [K.rail('wave', 360, 860, { w: 480, amp: 36, waves: 1.5, ph: 0, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(zz, bot), rails), stoneRails: rails };
    } },
  17: { name: 'Fregatte', en: 'Frigate', desc: 'Eine Fregatte, Rampen am Heck', descEn: 'A frigate, ramps at the stern', scene: ['ringstation', 220], items: ['bomb', 'laser', 'extra'],
    build: function (K) {
      var hull = K.ship(360, 620, 330, 46); K.armor(hull, 2, function (i) { return i % 3 === 1; }); K.z(hull, function (i) { return i % 3 === 0; });
      var spine = K.z(K.row(360, 420, 360, 800, 8), [0, 3, 7]); K.g(spine, [5]); K.b(spine, [1]);
      var guns = K.sym(K.z(K.row(250, 560, 250, 740, 4), [3]));
      var engines = K.z(K.join(K.ring(290, 1020, 40, 5), K.ring(430, 1020, 40, 5)), [0, 5]); K.g(engines, [2]);
      return { pegs: K.tidy(K.join(hull, spine, guns, engines)), ramps: [K.ramp(60, 930, 180, 1010), K.ramp(660, 930, 540, 1010)] };
    } },
  18: { name: 'Bienenwabe', en: 'Honeycomb', desc: 'Sechsecke, in der Mitte das Erz', descEn: 'Hexagons with ore in the middle', scene: ['deep', 50], items: ['bomb', 'chain'],
    build: function (K) {
      var hex = [], c = 0;
      for (var r = 0; r < 4; r++) for (var q = 0; q < 4 - (r % 2); q++) {
        var cx = 140 + q * 150 + (r % 2 ? 75 : 0), cy = 300 + r * 130, h = K.ring(cx, cy, 46, 6, 0, 0);
        K.armor(h, 2, (c % 4 === 1) ? [0, 2, 4] : []); hex = hex.concat(h, K.z([{ x: cx, y: cy }], [0])); c++;
      }
      K.g(hex, [8, 40]); K.b(hex, [22]);
      var tray = K.z(K.row(130, 1090, 590, 1090, 10), [2, 7]);
      var rails = [K.rail('arc', 360, 900, { w: 400, rot: Math.PI, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(hex, tray), rails), stoneRails: rails };
    } },
  19: { name: 'Die Acht', en: 'Figure Eight', desc: 'Steinacht in einer Brockenschleife', descEn: 'A stone eight inside a loop of rocks', scene: ['wormhole', 300], items: ['bomb', 'swarm', 'chain'],
    build: function (K) {
      var loop = K.z(K.eight(360, 700, 320, 46), function (i) { return i % 4 === 0; }); K.armor(loop, 2, function (i) { return i % 4 === 2; }); K.g(loop, [5]);
      var top = K.z(K.arc(360, 560, 330, -Math.PI / 2 - 0.85, -Math.PI / 2 + 0.85, 13), [0, 6, 12]); K.b(top, [3]); K.g(top, [9]);
      var low = K.sym(K.z(K.row(120, 1000, 260, 1100, 4), [3]));
      var rails = [K.rail('eight', 360, 700, { R: 66, z: 3, g: 1, b: 0 })];
      return { pegs: K.tidy(K.join(loop, top, low), rails), stoneRails: rails };
    } },
  20: { name: 'Piraten-Festung', en: 'Pirate Fortress', desc: 'Finale: Mauern, Türme und ein Tor', descEn: 'Finale: walls, towers and a gate', scene: ['sun', 15], items: ['bomb', 'laser', 'chain', 'extra', 'volley'],
    build: function (K) {
      var wall = K.path([[140, 430], [580, 430], [580, 920], [140, 920]], 46, true).filter(function (p) { return !(p.y < 440 && Math.abs(p.x - 360) < 60); });
      K.z(wall, function (i) { return i % 4 === 1; }); K.armor(wall, 2, function (i) { return i % 2 === 0; });
      var towers = []; [[140, 430], [580, 430], [140, 920], [580, 920]].forEach(function (p) { towers = towers.concat(K.armor(K.z(K.ring(p[0], p[1], 50, 7), [0]), 3, [2, 5])); });
      var keep = K.z(K.diamond(360, 680, 180, 220, 46), function (i) { return i % 2 === 0; }); K.armor(keep, 2, function (i) { return i % 4 === 1; });
      var heart = K.b([{ x: 360, y: 680 }], [0]);
      var yard = K.g(K.row(230, 1060, 490, 1060, 6), [1, 4]);
      var rails = [K.rail('arc', 360, 300, { w: 280, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(heart, keep, wall, towers, yard), rails), stoneRails: rails, ramps: [K.ramp(40, 700, 110, 790), K.ramp(680, 700, 610, 790)] };
    } },

  /* ===== Welt 3 – Eisfeld: Schwerkraftfelder, U-Rohre, erste langsame Bewegung ===== */
  21: { name: 'Eiskristall', en: 'Ice Crystal', desc: 'Sechs Arme um ein Schwerkraftfeld', descEn: 'Six arms around a gravity field', scene: ['ice', 195], items: ['bomb', 'laser'],
    build: function (K) {
      var c = [360, 650], arms = [];
      for (var k = 0; k < 6; k++) {
        var a = -Math.PI / 2 + k * Math.PI / 3, ca = Math.cos(a), sa = Math.sin(a), arm = [];
        for (var d = 90; d <= 290; d += 46) arm.push({ x: c[0] + ca * d, y: c[1] + sa * d });
        [-1, 1].forEach(function (sg) { var b = a + sg * 0.6; arm.push({ x: c[0] + ca * 230 + Math.cos(b) * 46, y: c[1] + sa * 230 + Math.sin(b) * 46 }); });
        K.z(arm, [3, 5]); K.armor(arm, 2, [1]); arms = arms.concat(arm);
      }
      K.g(arms, [4, 25]); K.b(arms, [14]);
      var tips = K.z(K.join(K.ring(110, 1090, 40, 5), K.ring(610, 1090, 40, 5)), [0, 5]);
      return { pegs: K.tidy(K.join(arms, tips)), wells: [K.well(360, 650, 110, 850)] };
    } },
  22: { name: 'Das U-Rohr', en: 'The U-Tube', desc: 'Ein Steinrohr, links und rechts Säulen', descEn: 'A stone tube between columns', scene: ['comet', 180], items: ['bomb', 'chain', 'extra'],
    build: function (K) {
      var cols = []; [90, 170, 550, 630].forEach(function (x, i) { var c = K.z(K.row(x, 330 + (i % 2) * 40, x, 1000 + (i % 2) * 40, 15), [2, 8, 13]); if (i % 3 === 0) K.armor(c, 2, [5, 10]); cols = cols.concat(c); });
      K.g(cols, [6, 40]); K.b(cols, [24]);
      var cap = K.z(K.arc(360, 420, 160, -Math.PI + 0.2, -0.2, 9), [0, 4, 8]);
      var inside = K.b([{ x: 360, y: 700 }], [0]);
      var floor = K.z(K.row(260, 1110, 460, 1110, 5), [0, 4]);
      var rails = [K.rail('utube', 360, 720, { R: 80, h: 220, z: 4, g: 1 })];
      return { pegs: K.tidy(K.join(cols, cap, inside, floor), rails), stoneRails: rails };
    } },
  23: { name: 'Gletscherspalten', en: 'Glacier Crevasses', desc: 'Eissäulen verschieden lang, ein Abstoßfeld', descEn: 'Ice columns of different lengths, a repulsor', scene: ['deep', 210], items: ['bomb', 'laser'],
    build: function (K) {
      var lens = [9, 13, 6, 15, 8, 12, 5, 10], cols = [];
      lens.forEach(function (n, i) { var x = 85 + i * 78, y0 = i % 2 ? 300 : 360; var c = K.z(K.row(x, y0, x, y0 + (n - 1) * 46, n), [n - 1, Math.floor(n / 2)]); if (i % 2) K.armor(c, 2, [1, 3]); cols = cols.concat(c); });
      K.g(cols, [5, 30, 60]); K.b(cols, [44]);
      return { pegs: K.tidy(cols), wells: [K.well(360, 760, 110, -1500)] };
    } },
  24: { name: 'Schneesturm', en: 'Snowstorm', desc: 'Ein Ring dreht sich langsam um das Erz', descEn: 'A ring slowly turns around the ore', scene: ['nebula', 205], items: ['bomb', 'chain', 'swarm'],
    build: function (K) {
      var spinRing = K.spin(K.z(K.ring(360, 620, 150, 19), function (i) { return i % 4 === 0; }), 360, 620, 0.22); K.g(spinRing, [6]);
      var core = K.z(K.join(K.ring(360, 620, 52, 6), [{ x: 360, y: 620 }]), [0, 3, 6]); K.armor(core, 2, [1, 4]);
      var w1 = K.z(K.wave(80, 640, 300, 26, 2, 13), [3, 9]), w2 = K.z(K.wave(80, 640, 960, 26, 2, 13, Math.PI), [3, 9]);
      K.b(w2, [6]); K.g(w1, [6]);
      var sides = K.sym(K.z(K.armor(K.row(70, 500, 70, 760, 6), 2, [2, 4]), [0, 5]));
      return { pegs: K.tidy(K.join(core, spinRing, w1, w2, sides)) };
    } },
  25: { name: 'Doppelrohr', en: 'Twin Tubes', desc: 'Zwei U-Rohre, dazwischen Erz', descEn: 'Two U-tubes with ore between them', scene: ['ice', 160], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var mid = K.z(K.row(360, 320, 360, 1000, 15), function (i) { return i % 3 === 1; }); K.armor(mid, 2, function (i) { return i % 3 === 2; }); K.g(mid, [6]);
      var crowns = K.z(K.join(K.arc(190, 520, 120, -Math.PI + 0.3, -0.3, 6), K.arc(530, 520, 120, -Math.PI + 0.3, -0.3, 6)), [0, 5, 6, 11]);
      var base = K.z(K.wave(90, 630, 1090, 24, 2, 12), [2, 6, 10]); K.b(base, [4]); K.g(base, [8]);
      var rails = [K.rail('utube', 190, 760, { R: 64, h: 170, z: 3, g: 1 }), K.rail('utube', 530, 760, { R: 64, h: 170, z: 3, g: 0 })];
      return { pegs: K.tidy(K.join(mid, crowns, base), rails), stoneRails: rails };
    } },
  26: { name: 'Eisberg', en: 'Iceberg', desc: 'Zwei Gipfel, gepanzerte Hänge, ein Sog', descEn: 'Two peaks, armored slopes, a pull', scene: ['moon', 190], items: ['bomb', 'laser', 'swarm'],
    build: function (K) {
      var ridge = K.path([[80, 1020], [290, 360], [420, 600], [520, 470], [650, 1020]], 46);
      K.z(ridge, function (i) { return i % 3 === 0; }); K.armor(ridge, 2, function (i) { return i % 2 === 1; });
      var ice = []; [520, 640, 760, 880].forEach(function (y, i) { var w = 60 + i * 50; ice = ice.concat(K.z(K.row(330 - w, y, 380 + w, y, Math.round((w * 2 + 50) / 50) + 1), [1, -2])); });
      K.g(ice, [3, 20]); K.b(ice, [12]);
      var peaks = K.z([{ x: 290, y: 300 }, { x: 520, y: 410 }], [0, 1]);
      return { pegs: K.tidy(K.join(peaks, ridge, ice)), wells: [K.well(360, 1080, 120, 1500)] };
    } },
  27: { name: 'Polarlicht', en: 'Aurora', desc: 'Drei Lichtwellen, die mittlere wandert', descEn: 'Three waves of light, the middle one drifts', scene: ['galaxy', 140], items: ['bomb', 'chain', 'extra'],
    build: function (K) {
      var w1 = K.z(K.wave(70, 650, 300, 40, 2, 14), [2, 7, 12]), w3 = K.z(K.wave(70, 650, 700, 40, 2, 14, Math.PI), [1, 6, 11]);
      var w2 = K.slide(K.z(K.wave(120, 600, 500, 40, 1.5, 11), [2, 5, 8]), 40, 0, 0.45); K.g(w2, [4]);
      K.armor(w3, 2, [3, 8]); K.g(w1, [5]); K.b(w3, [9]);
      var rails = [K.rail('wave', 360, 940, { w: 500, amp: 34, waves: 2, ph: Math.PI, z: 4, g: 1 })];
      var foot = K.z(K.row(160, 1110, 560, 1110, 9), [1, 4, 7]);
      return { pegs: K.tidy(K.join(w1, w2, w3, foot), rails), stoneRails: rails };
    } },
  28: { name: 'Kristallherz', en: 'Crystal Heart', desc: 'Ein Herz um eine Steinschnecke', descEn: 'A heart around a stone spiral', scene: ['pillars', 320], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var heart = K.heart(360, 620, 13, 46); K.z(heart, function (i) { return i % 3 === 0; }); K.armor(heart, 2, function (i) { return i % 3 === 1; }); K.g(heart, [4, 22]);
      var inner = K.z(K.heart(360, 610, 7.2, 44), [0, 6]); K.b(inner, [3]);
      var rays = K.sym(K.z(K.row(80, 1000, 220, 1110, 4), [0, 3]));
      var rails = [K.rail('spiral', 360, 640, { r0: 26, pitch: 30, turns: 1.5, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(heart, inner, rays), rails), stoneRails: rails, wells: [K.well(120, 330, 90, 1200), K.well(600, 330, 90, 1200)] };
    } },
  29: { name: 'Frostring', en: 'Frost Ring', desc: 'Ein Steinring, innen dreht sich Erz', descEn: 'A stone ring, ore spins inside', scene: ['wormhole', 200], items: ['bomb', 'laser', 'chain', 'extra'],
    build: function (K) {
      var spinIn = K.spin(K.z(K.ring(360, 640, 52, 7), [0, 3, 5]), 360, 640, -0.5);
      var hub = K.armor(K.z([{ x: 360, y: 640 }], [0]), 3);
      var outer = K.z(K.ring(360, 640, 250, 32, 0.3), function (i) { return i % 4 === 1; }); K.armor(outer, 2, function (i) { return i % 4 === 3; }); K.g(outer, [6, 22]); K.b(outer, [14]);
      var corners = K.z(K.join(K.ring(100, 280, 40, 5), K.ring(620, 280, 40, 5), K.ring(100, 1080, 40, 5), K.ring(620, 1080, 40, 5)), [0, 5, 10, 15]);
      var rails = [K.rail('ring', 360, 640, { R: 125, gap: 0.5, z: 4, g: 1 })];
      return { pegs: K.tidy(K.join(hub, spinIn, outer, corners), rails), stoneRails: rails, wells: [K.well(360, 1060, 90, -1300)] };
    } },
  30: { name: 'Titan-Rumpf', en: 'Titan Hull', desc: 'Finale: ein gepanzerter Titan mit Triebwerksröhren', descEn: 'Finale: an armored titan with engine tubes', scene: ['nebula', 25], items: ['bomb', 'laser', 'chain', 'volley', 'extra', 'swarm'],
    build: function (K) {
      var hull = K.path([[360, 190], [470, 420], [530, 680], [620, 900], [480, 980], [240, 980], [100, 900], [190, 680], [250, 420]], 46, true); K.z(hull, function (i) { return i % 4 === 0; }); K.armor(hull, 2, function (i) { return i % 2 === 1; }); K.armor(hull, 3, function (i) { return i % 8 === 2; });
      var deck = []; [380, 470, 560].forEach(function (y, i) { var w = 40 + i * 40; deck = deck.concat(K.z(K.row(360 - w, y, 360 + w, y, Math.round(w / 23) + 1), [0, -1])); });
      K.g(deck, [1, 6]); K.b(deck, [9]);
      var bridge = K.armor(K.z(K.ring(360, 300, 40, 5), [0]), 3, [2]);
      var rails = [K.rail('utube', 275, 790, { R: 42, h: 90, z: 2, g: 1 }), K.rail('utube', 445, 790, { R: 42, h: 90, z: 2, g: 0 })];
      var plume = K.z(K.row(200, 1100, 520, 1100, 8), [0, 3, 7]); K.g(plume, [5]);
      return { pegs: K.tidy(K.join(bridge, hull, deck, plume), rails), stoneRails: rails, wells: [K.well(90, 520, 80, 1200), K.well(630, 520, 80, 1200)] };
    } },
  /* ===== Welt 4 – Mondabbau: Wracks (Abpraller), Warp-Tore, Acht-Bahn ===== */
  31: { name: 'Wrackfeld', en: 'Wreck Field', desc: 'Fünf Wracks, Bögen öffnen sich zu ihnen', descEn: 'Five wrecks, arcs open toward them', scene: ['moon', 210], items: ['bomb', 'laser'],
    build: function (K) {
      var W = [[150, 420], [570, 420], [360, 640], [180, 880], [540, 880]].map(function (p) { return K.wreck(p[0], p[1]); });
      var arcs = []; W.forEach(function (w, i) { var a = K.z(K.arc(w.x, w.y, 92, -Math.PI / 2 - 1.2, -Math.PI / 2 + 1.2, 6), [0, 5]); if (i === 2) K.armor(a, 2, [2, 3]); arcs = arcs.concat(a); });
      K.g(arcs, [2, 20]); K.b(arcs, [14]);
      var top = K.z(K.row(160, 260, 560, 260, 9), [1, 4, 7]);
      var low = K.z(K.wave(110, 610, 1080, 26, 1.5, 11), [2, 5, 8]);
      return { pegs: K.tidy(K.join(top, arcs, low), { wrecks: W }), wrecks: W };
    } },
  32: { name: 'Das erste Tor', en: 'The First Gate', desc: 'Ein Warp-Tor bringt die Drohne nach unten rechts', descEn: 'A warp gate sends the drone to the lower right', scene: ['planet', 30], items: ['bomb', 'chain'],
    build: function (K) {
      var G = [K.gates(110, 300, 600, 820)];
      var gem = K.z(K.diamond(520, 400, 260, 260, 46), function (i) { return i % 2 === 0; }); K.armor(gem, 2, [1, 5]); K.g(gem, [3]);
      var nest = K.z(K.ring(220, 860, 100, 13), function (i) { return i % 3 === 0; }); K.b(nest, [7]); K.g(nest, [4]);
      var core = K.z([{ x: 220, y: 860 }], [0]);
      var slope = K.z(K.row(120, 560, 400, 700, 7), [1, 3, 5]);
      var foot = K.z(K.row(440, 1080, 660, 1080, 6), [0, 5]);
      return { pegs: K.tidy(K.join(core, gem, nest, slope, foot), { gates: G }), gatePairs: G };
    } },
  33: { name: 'Mondsichel', en: 'Crescent Moon', desc: 'Eine Sichel aus Brocken um ein Wrack', descEn: 'A crescent of rocks around a wreck', scene: ['deep', 45], items: ['bomb', 'laser', 'extra'],
    build: function (K) {
      var crescO = K.z(K.arc(330, 650, 330, 1.9, 4.4, 19), function (i) { return i % 3 === 1; }), crescI = K.z(K.arc(420, 650, 250, 2.15, 4.15, 12), function (i) { return i % 2 === 1; });
      K.armor(crescO, 2, function (i) { return i % 4 === 3; }); K.g(crescO, [8]); K.b(crescI, [6]);
      var W = [K.wreck(470, 650, { type: 'slide', x0: 470, x1: 470, y0: 560, y1: 740, w: 0.5, a0: 0 })];
      var stars = K.z(K.join(K.ring(600, 300, 40, 5), K.ring(620, 1000, 40, 5)), [0, 5]); K.g(stars, [2]);
      var rails = [K.rail('jump', 560, 860, { w: 170, flip: true, z: 2, g: 0 })];
      return { pegs: K.tidy(K.join(crescO, crescI, stars), { rails: rails, wrecks: W }), stoneRails: rails, wrecks: W };
    } },
  34: { name: 'Bergbau-Gerüst', en: 'Mining Rig', desc: 'Ein Gitter mit Lücken, Wracks an den Ecken', descEn: 'A lattice with gaps, wrecks at the corners', scene: ['shipyard', 200], items: ['bomb', 'chain'],
    build: function (K) {
      var grid = K.grid(110, 330, 11, 9, 50, 80).filter(function (p, i) { var c = Math.round((p.x - 110) / 50), r = Math.round((p.y - 330) / 80); return !((c % 4 === 2) && (r % 3 === 1)) && !(c > 3 && c < 7 && r > 2 && r < 6); });
      K.z(grid, function (i, p) { return (Math.round((p.x - 110) / 50) + Math.round((p.y - 330) / 80)) % 5 === 0; });
      K.armor(grid, 2, function (i, p) { return Math.round((p.y - 330) / 80) === 4 && i % 2 === 0; }); K.g(grid, [10, 50]); K.b(grid, [30]);
      var core = K.z(K.ring(360, 650, 50, 6), [0, 3]);
      var W = [K.wreck(60, 250), K.wreck(660, 250), K.wreck(60, 1080), K.wreck(660, 1080)];
      return { pegs: K.tidy(K.join(core, grid), { wrecks: W }), wrecks: W };
    } },
  35: { name: 'Achterbahn', en: 'Roller Coaster', desc: 'Eine stehende Steinacht, ein Tor wirft hinein', descEn: 'A standing stone eight, a gate throws you in', scene: ['gasgiant', 260], items: ['bomb', 'swarm', 'extra'],
    build: function (K) {
      var rails = [K.rail('eight', 360, 650, { R: 70, rot: Math.PI / 2, z: 4, g: 1, b: 1 })];
      var G = [K.gates(90, 1060, 360, 290)];
      var cols = K.sym(K.z(K.row(170, 360, 170, 960, 13), [1, 5, 9, 12])); K.armor(cols, 2, function (i) { return i % 13 === 3 || i % 13 === 7; });
      K.g(cols, [6]);
      var crown = K.z(K.arc(360, 360, 130, Math.PI + 0.3, 2 * Math.PI - 0.3, 7), [0, 3, 6]);
      var base = K.z(K.row(250, 1080, 620, 1080, 8), [2, 5]); K.b(base, [7]);
      return { pegs: K.tidy(K.join(cols, crown, base), { rails: rails, gates: G }), stoneRails: rails, gatePairs: G };
    } },
  36: { name: 'Der Krater', en: 'The Crater', desc: 'Kraterränder, in der Mitte gleitet ein Wrack', descEn: 'Crater rims, a wreck glides in the middle', scene: ['moon', 330], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var rims = []; [130, 210, 290].forEach(function (R, i) { var r = K.z(K.arc(360, 760, R, Math.PI + 0.25, 2 * Math.PI - 0.25, Math.round(R * 2.6 / 47) + 1), function (k) { return k % 2 === i % 2; }); if (i === 1) K.armor(r, 2, function (k) { return k % 3 === 2; }); rims = rims.concat(r); });
      var floor = K.z(K.arc(360, 600, 330, 0.55, Math.PI - 0.55, 12), [1, 5, 10]); K.g(floor, [3, 8]); K.b(floor, [6]);
      var W = [K.wreck(360, 700, { type: 'slide', x0: 270, x1: 450, y0: 700, y1: 700, w: 0.55, a0: 0 })];
      var cap = K.z(K.row(200, 280, 520, 280, 8), [2, 5]);
      return { pegs: K.tidy(K.join(rims, floor, cap), { wrecks: W }), wrecks: W };
    } },
  37: { name: 'Förderturm', en: 'Hoist Tower', desc: 'Eine Leiter in der Mitte, Tore an den Seiten', descEn: 'A ladder in the middle, gates at the sides', scene: ['deep', 15], items: ['bomb', 'laser', 'double'],
    build: function (K) {
      var rails2 = K.join(K.row(310, 300, 310, 1000, 15), K.row(410, 300, 410, 1000, 15));
      K.z(rails2, function (i) { return i % 4 === 1; }); K.armor(rails2, 2, function (i) { return i % 4 === 3; });
      var rungs = []; for (var y = 345; y < 1000; y += 140) rungs.push({ x: 360, y: y });
      K.z(rungs, [0, 2, 4]); K.g(rungs, [1]);
      var G = [K.gates(80, 1000, 640, 300), K.gates(640, 1000, 80, 300)];
      var wings = K.sym(K.z(K.arc(130, 650, 90, -1.2, 1.2, 5), [2])); K.b(wings, [0]);
      return { pegs: K.tidy(K.join(rails2, rungs, wings), { gates: G }), gatePairs: G, ramps: [K.ramp(150, 1110, 260, 1060), K.ramp(570, 1110, 460, 1060)] };
    } },
  38: { name: 'Mondbasis', en: 'Moon Base', desc: 'Drei Kuppeln, die mittlere aus Stein', descEn: 'Three domes, the middle one of stone', scene: ['planet', 170], items: ['bomb', 'chain', 'swarm'],
    build: function (K) {
      var d1 = K.z(K.arc(150, 760, 110, Math.PI + 0.2, 2 * Math.PI - 0.2, 7), [0, 3, 6]), d3 = K.z(K.arc(570, 760, 110, Math.PI + 0.2, 2 * Math.PI - 0.2, 7), [0, 3, 6]);
      K.armor(d1, 2, [1, 5]); K.armor(d3, 2, [2, 4]);
      var in1 = K.g(K.row(110, 730, 190, 730, 3), [1]), in3 = K.b(K.row(530, 730, 610, 730, 3), [1]);
      var masts = K.z(K.join(K.row(150, 300, 150, 520, 5), K.row(570, 300, 570, 520, 5), K.row(360, 290, 360, 470, 4)), [0, 5, 10]);
      var ground = K.z(K.row(90, 900, 630, 900, 12), [0, 4, 7, 11]); K.g(ground, [2]);
      var W = [K.wreck(360, 1060)];
      var rails = [K.rail('arc', 360, 640, { w: 230, z: 3, g: 0 })];
      return { pegs: K.tidy(K.join(d1, d3, in1, in3, masts, ground), { rails: rails, wrecks: W }), stoneRails: rails, wrecks: W };
    } },
  39: { name: 'Gezeitenkurve', en: 'Tidal Curve', desc: 'Ein großes S, Wracks fahren mit der Flut', descEn: 'A big S, wrecks ride the tide', scene: ['comet', 280], items: ['bomb', 'laser', 'chain', 'double'],
    build: function (K) {
      var S = K.path([[600, 260], [300, 260], [160, 400], [300, 560], [430, 640], [560, 760], [420, 920], [120, 920]], 46);
      K.z(S, function (i) { return i % 3 === 1; }); K.armor(S, 2, function (i) { return i % 6 === 3; }); K.g(S, [8, 26]); K.b(S, [17]);
      var dots = K.z(K.join(K.row(560, 450, 640, 450, 3), K.row(90, 680, 170, 680, 3)), [1, 4]);
      var W = [K.wreck(470, 420, { type: 'slide', x0: 430, x1: 520, y0: 420, y1: 420, w: 0.4, a0: 0 }), K.wreck(250, 780, { type: 'slide', x0: 200, x1: 290, y0: 780, y1: 780, w: 0.4, a0: Math.PI })];
      var tail = K.z(K.row(250, 1090, 650, 1090, 9), [1, 4, 7]);
      return { pegs: K.tidy(K.join(S, dots, tail), { wrecks: W }), wrecks: W };
    } },
  40: { name: 'Sternentor', en: 'Stargate', desc: 'Finale: ein Torring mit drehendem Kern und zwei Sprungpaaren', descEn: 'Finale: a gate ring with a spinning core and two jump pairs', scene: ['gate', 190], items: ['bomb', 'laser', 'chain', 'swarm', 'extra'],
    build: function (K) {
      var c = [360, 640];
      var ring = K.z(K.ring(c[0], c[1], 235, 30, 0.22), function (i) { return i % 3 === 0; }); K.armor(ring, 2, function (i) { return i % 6 === 1; }); K.g(ring, [5, 20]); K.b(ring, [14]);
      var core = K.spin(K.z(K.ring(c[0], c[1], 110, 14), function (i) { return i % 2 === 0; }), c[0], c[1], 0.3);
      var heart = K.armor(K.z([{ x: c[0], y: c[1] }], [0]), 2);
      var G = [K.gates(90, 260, 630, 1060), K.gates(630, 260, 90, 1060)];
      var rails = [K.rail('arc', 360, 300, { w: 300, z: 3, g: 1 })];
      var feet = K.z(K.row(250, 1090, 470, 1090, 5), [0, 2, 4]);
      return { pegs: K.tidy(K.join(heart, core, ring, feet), { rails: rails, gates: G }), stoneRails: rails, gatePairs: G };
    } },

  /* ===== Welt 5 – Wurmloch-Raum: Beschleunigerbahnen, Trichter ===== */
  41: { name: 'Beschleuniger', en: 'Accelerator', desc: 'Eine Bahn schießt die Drohne nach rechts', descEn: 'A rail fires the drone to the right', scene: ['wormhole', 190], items: ['bomb', 'chain', 'laser'],
    build: function (K) {
      var T = [K.track([[70, 760], [190, 690], [300, 640]])];
      var target = K.z(K.grid(400, 380, 6, 6, 48, 60, true), function (i) { return i % 3 === 0; }); K.armor(target, 2, function (i) { return i % 6 === 4; }); K.g(target, [8, 25]); K.b(target, [16]);
      var arc = K.z(K.arc(200, 700, 200, -Math.PI + 0.25, -Math.PI / 2 - 0.2, 6), [0, 5]);
      var low = K.z(K.wave(90, 630, 1020, 30, 2, 13), [1, 4, 7, 10, 12]);
      return { pegs: K.tidy(K.join(target, arc, low), { tracks: T }), tracks: T };
    } },
  42: { name: 'Der Trichter', en: 'The Funnel', desc: 'Zwei Reihen laufen zu, darunter wartet das Erz', descEn: 'Two rows narrow down, ore waits below', scene: ['blackhole', 25], items: ['bomb', 'chain', 'double'],
    build: function (K) {
      var fun = K.sym(K.z(K.row(80, 300, 300, 760, 11), function (i) { return i % 3 === 2; })); K.armor(fun, 2, function (i) { return i % 11 === 4; });
      var pool = K.z(K.grid(250, 860, 5, 3, 55, 60, true), function (i) { return i % 2 === 0; }); K.g(pool, [3]); K.b(pool, [7]);
      var spout = K.z(K.row(360, 330, 360, 640, 7), [0, 2, 4, 6]); K.g(spout, [5]);
      var T = [K.track([[600, 1110], [660, 980], [640, 860]])];
      var rails = [K.rail('spiral', 560, 330, { r0: 22, pitch: 28, turns: 1.3, z: 3, g: 0 })];
      return { pegs: K.tidy(K.join(fun, pool, spout), { tracks: T, rails: rails }), tracks: T, stoneRails: rails };
    } },
  43: { name: 'Wirbel', en: 'Vortex', desc: 'Drei Spiralarme drehen sich langsam', descEn: 'Three spiral arms turn slowly', scene: ['galaxy', 320], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var arms = []; for (var k = 0; k < 3; k++) arms = arms.concat(K.z(K.spiral(360, 640, 70, 110, 1.35, 46, k * 2.094), function (i) { return i % 5 === 2; }));
      arms = K.spin(arms, 360, 640, 0.15); K.g(arms, [4, 20]);
      var hub = K.armor(K.z(K.ring(360, 640, 34, 4), [0, 2]), 2, [1, 3]);
      var outer = K.z(K.ring(360, 640, 300, 38, 0.3), function (i) { return i % 4 === 2; }); K.b(outer, [10]); K.armor(outer, 2, function (i) { return i % 8 === 0; });
      return { pegs: K.tidy(K.join(hub, arms, outer)) };
    } },
  44: { name: 'Ringbahn', en: 'Loop Line', desc: 'Eine Beschleunigerschleife um einen Panzerkern', descEn: 'An accelerator loop around an armored core', scene: ['pulsar', 60], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var T = [K.track([[570, 760], [470, 900], [250, 900], [150, 760]])];
      var core = K.z(K.grid(250, 560, 5, 5, 55, 50, true), function (i) { return i % 2 === 1; }); K.armor(core, 2, function (i) { return i % 4 === 0; }); K.g(core, [0]);
      var top = K.z(K.arc(360, 600, 380, -Math.PI / 2 - 0.65, -Math.PI / 2 + 0.65, 12), [1, 5, 10]); K.b(top, [3]);
      var sides = K.sym(K.z(K.row(70, 520, 70, 800, 6), [1, 4]));
      var low = K.z(K.row(200, 1080, 520, 1080, 7), [0, 3, 6]); K.g(low, [5]);
      var rails = [K.rail('arc', 360, 290, { w: 240, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(core, top, sides, low), { tracks: T, rails: rails }), tracks: T, stoneRails: rails };
    } },
  45: { name: 'Zwillingswirbel', en: 'Twin Vortex', desc: 'Zwei Ringe drehen gegeneinander, ein Tor verbindet', descEn: 'Two rings counter-rotate, a gate links them', scene: ['binary', 230], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var r1 = K.spin(K.z(K.ring(220, 520, 120, 15, 0.4), function (i) { return i % 3 === 0; }), 220, 520, 0.4), r2 = K.spin(K.z(K.ring(500, 860, 120, 15, 0.4), function (i) { return i % 3 === 0; }), 500, 860, -0.4);
      K.g(r1, [4]); K.g(r2, [7]);
      var c1 = K.armor(K.z(K.ring(220, 520, 42, 5), [0, 3]), 2, [1]), c2 = K.armor(K.z(K.ring(500, 860, 42, 5), [0, 3]), 2, [2]);
      var G = [K.gates(560, 320, 160, 1060)];
      var diag = K.z(K.row(400, 400, 640, 620, 6), [1, 4]); K.b(diag, [3]);
      var diag2 = K.z(K.row(90, 760, 320, 1000, 6), [2, 5]);
      return { pegs: K.tidy(K.join(c1, c2, r1, r2, diag, diag2), { gates: G }), gatePairs: G };
    } },
  46: { name: 'Ereignishorizont', en: 'Event Horizon', desc: 'Ringe um ein starkes Schwerkraftfeld', descEn: 'Rings around a strong gravity field', scene: ['blackhole', 300], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var rings = []; [150, 220, 290].forEach(function (R, i) { var r = K.z(K.ring(360, 660, R, Math.round(2 * Math.PI * R / 47), 0.25 + i * 0.05, i % 2 ? Math.PI / 2 : -Math.PI / 2), function (k) { return k % 4 === i; }); K.armor(r, 2, function (k) { return k % 4 === (i + 2) % 4; }); rings = rings.concat(r); });
      K.g(rings, [5, 30, 55]); K.b(rings, [40]);
      var rails = [K.rail('ring', 360, 660, { R: 80, gap: 0.6, z: 3, g: 1 })];
      return { pegs: K.tidy(rings, { rails: rails }), stoneRails: rails, wells: [K.well(360, 660, 120, 1700)] };
    } },
  47: { name: 'Raumfalte', en: 'Space Fold', desc: 'Ein Zickzack, Tore an den Knicken', descEn: 'A zigzag with gates at the folds', scene: ['nebula', 80], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var Z = K.path([[90, 300], [620, 450], [100, 640], [620, 830], [90, 1020]], 47);
      K.z(Z, function (i) { return i % 3 === 1; }); K.armor(Z, 2, function (i) { return i % 6 === 3; }); K.g(Z, [6, 30]); K.b(Z, [18]);
      var G = [K.gates(640, 330, 90, 520), K.gates(640, 720, 90, 900)];
      var pockets = K.z(K.join(K.ring(470, 590, 38, 5), K.ring(250, 770, 38, 5)), [0, 5]);
      return { pegs: K.tidy(K.join(Z, pockets), { gates: G }), gatePairs: G, ramps: [K.ramp(300, 1110, 420, 1110)] };
    } },
  48: { name: 'Gravitationslinse', en: 'Gravity Lens', desc: 'Bögen biegen sich um zwei Abstoßfelder', descEn: 'Arcs bend around two repulsors', scene: ['deep', 120], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var a1 = K.z(K.arc(220, 520, 150, -0.9, 0.9, 7), [0, 3, 6]), a2 = K.z(K.arc(500, 820, 150, Math.PI - 0.9, Math.PI + 0.9, 7), [0, 3, 6]);
      var b1 = K.z(K.arc(220, 520, 220, -0.75, 0.75, 9), [1, 7]), b2 = K.z(K.arc(500, 820, 220, Math.PI - 0.75, Math.PI + 0.75, 9), [1, 7]);
      K.armor(b1, 2, [3, 5]); K.armor(b2, 2, [3, 5]); K.g(a1, [1]); K.g(a2, [5]); K.b(b2, [4]);
      var top = K.z(K.row(140, 280, 580, 280, 10), [0, 3, 6, 9]);
      var low = K.z(K.row(140, 1090, 580, 1090, 10), [1, 5, 8]);
      return { pegs: K.tidy(K.join(a1, a2, b1, b2, top, low)), wells: [K.well(220, 520, 90, -1600), K.well(500, 820, 90, -1600)] };
    } },
  49: { name: 'Sprungpunkte', en: 'Jump Points', desc: 'Drei Dreiecke, drei Torpaare, eine Bahn', descEn: 'Three triangles, three gate pairs, one rail', scene: ['comet', 160], items: ['bomb', 'laser', 'chain', 'swarm', 'extra'],
    build: function (K) {
      function tri(cx, cy, s) { return K.path([[cx, cy - s], [cx + s * 0.87, cy + s / 2], [cx - s * 0.87, cy + s / 2]], 46, true); }
      var t1 = K.z(tri(180, 380, 110), function (i) { return i % 2 === 0; }), t2 = K.z(tri(540, 600, 110), function (i) { return i % 2 === 0; }), t3 = K.z(tri(200, 900, 110), function (i) { return i % 2 === 0; });
      K.armor(t2, 2, function (i) { return i % 2 === 1; }); K.g(t1, [1]); K.g(t3, [3]); K.b(t2, [3]);
      var cores = K.z([{ x: 180, y: 400 }, { x: 540, y: 620 }, { x: 200, y: 920 }], [0, 1, 2]); K.armor(cores, 2, [1]);
      var G = [K.gates(620, 260, 330, 640), K.gates(80, 640, 600, 1000), K.gates(420, 1100, 400, 260)];
      var T = [K.track([[380, 820], [470, 760], [600, 790]])];
      return { pegs: K.tidy(K.join(cores, t1, t2, t3), { gates: G, tracks: T }), gatePairs: G, tracks: T };
    } },
  50: { name: 'Das Wurmloch', en: 'The Wormhole', desc: 'Finale: ein Tunnel aus Ringen, ein Sog in der Tiefe', descEn: 'Finale: a tunnel of rings with a pull in the depths', scene: ['wormhole', 260], items: ['bomb', 'laser', 'chain', 'swarm', 'drill', 'extra'],
    build: function (K) {
      var tun = []; [[360, 360, 280, 0.42], [360, 560, 210, 0.45], [360, 730, 145, 0.5], [360, 870, 90, 0.55]].forEach(function (e, i) {
        var r = K.squash(K.ring(e[0], e[1], e[2], Math.round(2 * Math.PI * e[2] / 52), 0), e[0], e[1], 1, e[3]);
        K.z(r, function (k) { return k % 3 === i % 3; }); K.armor(r, 2, function (k) { return k % 4 === (i + 1) % 4; }); tun = tun.concat(r);
      });
      K.g(tun, [4, 25, 40]); K.b(tun, [33]);
      var spin = K.spin(K.z(K.ring(360, 1010, 60, 7), [0, 3, 5]), 360, 1010, 0.6);
      var G = [K.gates(70, 280, 650, 1100), K.gates(650, 280, 70, 1100)];
      var T = [K.track([[80, 760], [140, 640], [110, 520]]), K.track([[640, 760], [580, 640], [610, 520]])];
      return { pegs: K.tidy(K.join(tun, spin), { gates: G, tracks: T }), gatePairs: G, tracks: T, wells: [K.well(360, 870, 120, 1500)] };
    } },
  /* ===== Welt 6 – Schlachtfeld: erste bewegte Steinbahnen, Pendel ===== */
  51: { name: 'Gleitende Brücke', en: 'Gliding Bridge', desc: 'Eine Steinbrücke gleitet hin und her', descEn: 'A stone bridge glides back and forth', scene: ['wrecks', 20], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var rails = [K.rail('arc', 360, 560, { w: 260, z: 4, g: 1, mv: { type: 'slide', x0: 280, x1: 440, y0: 560, y1: 560, w: 0.5, a0: 0 } })];
      var over = K.z(K.row(120, 300, 600, 300, 11), [0, 3, 5, 7, 10]); K.g(over, [9]);
      var hulls = []; [[170, 820], [360, 900], [550, 820]].forEach(function (p) { hulls = hulls.concat(K.z(K.ship(p[0], p[1], 90, 44), [0, 3, 6])); });
      K.armor(hulls, 2, function (i) { return i % 4 === 2; }); K.b(over, [2]);
      var low = K.z(K.row(160, 1110, 560, 1110, 9), [1, 4, 7]);
      return { pegs: K.tidy(K.join(over, hulls, low), { rails: rails }), stoneRails: rails };
    } },
  52: { name: 'Das Pendel', en: 'The Pendulum', desc: 'Eine Steinschale schwingt wie ein Pendel', descEn: 'A stone bowl swings like a pendulum', scene: ['sun', 35], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var rails = [K.rail('arc', 360, 300, { w: 220, rot: Math.PI, hang: 300, z: 4, g: 1, swing: { a: 0.32, w: 0.75 } })];
      var cage = K.sym(K.z(K.arc(360, 600, 300, Math.PI - 0.95, Math.PI + 0.95, 11), [1, 5, 9])); K.armor(cage, 2, function (i) { return i % 11 === 3; });
      var top = K.z(K.row(220, 250, 500, 250, 7), [1, 3, 5]);
      var pit = K.z(K.ring(360, 960, 70, 9, 0.5), [1, 4, 7]); K.b(pit, [3]); K.g(pit, [6]);
      var bars = K.z(K.join(K.row(120, 1080, 240, 1080, 3), K.row(480, 1080, 600, 1080, 3)), [0, 5]);
      return { pegs: K.tidy(K.join(top, cage, pit, bars), { rails: rails }), stoneRails: rails };
    } },
  53: { name: 'Kreuzfeuer', en: 'Crossfire', desc: 'Zwei Linien kreuzen sich, Wracks fahren dazwischen', descEn: 'Two lines cross, wrecks drive between them', scene: ['lava', 10], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var x1 = K.row(90, 300, 630, 1040, 17).filter(function (p) { return Math.hypot(p.x - 360, p.y - 670) > 60; }), x2 = K.row(630, 300, 90, 1040, 17).filter(function (p) { return Math.hypot(p.x - 360, p.y - 670) > 60; });
      var X = K.join(x1, x2); K.z(X, function (i) { return i % 2 === 1; }); K.g(X, [5, 22]); K.b(X, [14]);
      var core = K.armor(K.z(K.ring(360, 670, 30, 4), [0, 2]), 2, [1, 3]);
      var W = [K.wreck(150, 670, { type: 'slide', x0: 150, x1: 150, y0: 600, y1: 740, w: 0.5, a0: 0 }), K.wreck(570, 670, { type: 'slide', x0: 570, x1: 570, y0: 600, y1: 740, w: 0.5, a0: Math.PI })];
      return { pegs: K.tidy(K.join(core, X), { wrecks: W }), wrecks: W };
    } },
  54: { name: 'Geschwader', en: 'Squadron', desc: 'Drei Pfeilformationen fliegen eine Acht', descEn: 'Three arrow formations fly a figure eight', scene: ['deep', 220], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      function vee(cx, cy) { return K.join([{ x: cx, y: cy }], K.row(cx - 46, cy - 40, cx - 138, cy - 120, 3), K.row(cx + 46, cy - 40, cx + 138, cy - 120, 3)); }
      var f1 = K.lis(K.z(vee(360, 420), [0, 3, 6]), 60, 30, 0.35, 0), f2 = K.lis(K.z(vee(200, 760), [0, 3, 6]), 40, 30, 0.35, 2), f3 = K.lis(K.z(vee(520, 760), [0, 3, 6]), 40, 30, 0.35, 4);
      K.g(f1, [2]); K.g(f3, [5]); K.armor(f2, 2, [1, 4]);
      var flak = K.z(K.row(90, 1060, 630, 1060, 12), [1, 4, 7, 10]); K.b(flak, [6]); K.armor(flak, 2, [3, 8]);
      var side = K.sym(K.z(K.row(60, 380, 60, 860, 9), [2, 6]));
      return { pegs: K.tidy(K.join(f1, f2, f3, flak, side)) };
    } },
  55: { name: 'Trümmerring', en: 'Debris Ring', desc: 'Wracks kreisen um ein Erznest', descEn: 'Wrecks orbit around an ore nest', scene: ['ringstation', 200], items: ['bomb', 'laser', 'chain', 'slowmo'],
    build: function (K) {
      var W = [0, 1, 2, 3].map(function (i) { var a = i * Math.PI / 2; return K.wreck(360 + 200 * Math.cos(a), 680 + 200 * Math.sin(a), { cx: 360, cy: 680, rad: 200, a0: a, w: 0.3 }); });
      var nest = K.z(K.grid(270, 600, 4, 4, 55, 50, true), function (i) { return i % 2 === 0; }); K.armor(nest, 2, [1, 7]); K.g(nest, [3]); K.b(nest, [9]);
      var outer = K.z(K.ring(360, 680, 300, 38, 0.32), function (i) { return i % 3 === 0; }); K.armor(outer, 2, function (i) { return i % 9 === 4; }); K.g(outer, [10]);
      return { pegs: K.tidy(K.join(nest, outer), { wrecks: W }), wrecks: W };
    } },
  56: { name: 'Pendelbrücke', en: 'Pendulum Bridge', desc: 'Zwei Pendel schwingen gegeneinander', descEn: 'Two pendulums swing against each other', scene: ['nebula', 15], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var rails = [K.rail('arc', 210, 260, { w: 170, rot: Math.PI, hang: 330, z: 3, g: 1, swing: { a: 0.3, w: 0.8 } }), K.rail('arc', 510, 260, { w: 170, rot: Math.PI, hang: 330, z: 3, g: 0, swing: { a: 0.3, w: 0.8, p: Math.PI } })];
      var bridge = K.z(K.arc(360, 1300, 520, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55, 13), [0, 4, 8, 12]);
      var posts = K.z(K.join(K.ring(130, 860, 50, 7), K.ring(590, 860, 50, 7)), [0, 3, 7, 10]); K.b(posts, [5]); K.armor(bridge, 2, [2, 6, 10]); K.b(bridge, [5]);
      var mid = K.z(K.row(360, 260, 360, 700, 10), [1, 4, 7, 9]); K.g(mid, [5]);
      var wings = K.sym(K.z(K.row(70, 300, 70, 500, 5), [2]));
      return { pegs: K.tidy(K.join(mid, bridge, wings, posts), { rails: rails }), stoneRails: rails };
    } },
  57: { name: 'Minenfeld', en: 'Minefield', desc: 'Ein Gitter aus Minen, zwei Abstoßfelder', descEn: 'A grid of mines, two repulsors', scene: ['planet', 60], items: ['bomb', 'laser', 'chain', 'slowmo'],
    build: function (K) {
      var mines = K.grid(100, 290, 9, 10, 65, 85, true);
      K.z(mines, function (i) { return i % 4 === 1; }); K.armor(mines, 2, function (i) { return i % 4 === 3; }); K.armor(mines, 3, function (i) { return i % 16 === 7; });
      K.g(mines, [12, 50]); K.b(mines, [33]);
      return { pegs: K.tidy(mines, { keep: 1 }), wells: [K.well(230, 560, 90, -1500), K.well(490, 860, 90, -1500)] };
    } },
  58: { name: 'Schildwall', en: 'Shield Wall', desc: 'Ein dichter Panzerwall schützt das Erz', descEn: 'A tight armored wall guards the ore', scene: ['pulsar', 25], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var wall = K.armor(K.row(130, 640, 590, 640, 18), 2); K.armor(wall, 3, [0, 17]);
      var gapWall = wall.filter(function (p, i) { return i !== 5 && i !== 12; });
      var behind = K.z(K.grid(180, 760, 8, 3, 52, 70, true), function (i) { return i % 2 === 0; }); K.g(behind, [5]); K.b(behind, [11]);
      var front = K.z(K.arc(360, 640, 260, Math.PI + 0.35, 2 * Math.PI - 0.35, 11), [0, 3, 7, 10]); K.g(front, [5]);
      return { pegs: K.tidy(K.join(gapWall, behind, front), { tight: true }), ramps: [K.ramp(40, 560, 120, 620), K.ramp(680, 560, 600, 620)] };
    } },
  59: { name: 'Gleitflug', en: 'Glide Path', desc: 'Eine lange Steinwelle hebt und senkt sich', descEn: 'A long stone wave rises and falls', scene: ['binary', 300], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var rails = [K.rail('wave', 360, 720, { w: 520, amp: 40, waves: 2, ph: 0, z: 5, g: 1, mv: { type: 'slide', x0: 360, x1: 360, y0: 680, y1: 760, w: 0.55, a0: 0 } })];
      var clouds = []; [[170, 380], [360, 330], [550, 380]].forEach(function (p, i) { clouds = clouds.concat(K.z(K.ring(p[0], p[1], 60, 8, 0.5, Math.PI / 2), [1, 5])); });
      K.armor(clouds, 2, [3, 11]); K.g(clouds, [7]); K.b(clouds, [13]);
      var hang = K.z(K.row(110, 520, 610, 520, 11), [2, 5, 8]);
      var ground = K.z(K.wave(90, 630, 1040, 24, 2.5, 13), [1, 4, 7, 10]);
      return { pegs: K.tidy(K.join(clouds, hang, ground), { rails: rails }), stoneRails: rails };
    } },
  60: { name: 'Flotte in Formation', en: 'Fleet in Formation', desc: 'Finale: fünf Schiffe im Keil, ein Pendel, fahrende Wracks', descEn: 'Finale: five ships in a wedge, a pendulum, moving wrecks', scene: ['gasgiant', 200], items: ['bomb', 'laser', 'chain', 'swarm', 'slowmo', 'extra'],
    build: function (K) {
      var ships = [];
      [[360, 360], [220, 540], [500, 540], [110, 720], [610, 720]].forEach(function (p, i) {
        var sh = K.ship(p[0], p[1], 100, 44); K.z(sh, function (k) { return k % 3 === 0; }); K.armor(sh, 2, function (k) { return k % 3 === 1; }); ships = ships.concat(sh);
      });
      ships = K.lis(ships, 25, 15, 0.3, 0); K.g(ships, [4, 30]); K.b(ships, [18]);
      var rails = [K.rail('arc', 360, 780, { w: 270, rot: Math.PI, hang: 200, z: 4, g: 1, swing: { a: 0.3, w: 0.7 } })];
      var W = [K.wreck(200, 1080, { type: 'slide', x0: 120, x1: 300, y0: 1080, y1: 1080, w: 0.5, a0: 0 }), K.wreck(520, 1080, { type: 'slide', x0: 420, x1: 600, y0: 1080, y1: 1080, w: 0.5, a0: Math.PI })];
      return { pegs: K.tidy(ships, { rails: rails, wrecks: W }), stoneRails: rails, wrecks: W };
    } },

  /* ===== Welt 7 – Anomalie: Ziegelwände, verdeckte Ziele ===== */
  61: { name: 'Ziegelmauer', en: 'Brick Wall', desc: 'Eine Mauer aus dichten Steinen, dahinter das Erz', descEn: 'A wall of tight rocks with ore behind it', scene: ['pillars', 30], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var wall = K.join(K.row(100, 560, 620, 560, 20), K.row(113, 586, 607, 586, 19));
      K.armor(wall, 2, function (i) { return i % 3 === 1; }); var holes = wall.filter(function (p, i) { return i % 20 !== 6 && i % 20 !== 14; });
      var vault = K.z(K.grid(150, 700, 9, 4, 52, 72, true), function (i) { return i % 3 === 0; }); K.g(vault, [4]); K.b(vault, [14]);
      var sky = K.z(K.arc(360, 560, 300, Math.PI + 0.3, 2 * Math.PI - 0.3, 13), [0, 4, 8, 12]); K.g(sky, [6]);
      return { pegs: K.tidy(K.join(holes, vault, sky), { tight: true }) };
    } },
  62: { name: 'Verborgener Kern', en: 'Hidden Core', desc: 'Das Erz liegt in einer Kiste mit zwei Schlitzen', descEn: 'The ore lies in a box with two slots', scene: ['blackhole', 240], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var box = K.path([[220, 560], [500, 560], [500, 820], [220, 820]], 27, true).filter(function (p) { return !(Math.abs(p.y - 560) < 2 && Math.abs(p.x - 300) < 20) && !(Math.abs(p.x - 500) < 2 && Math.abs(p.y - 740) < 20); });
      K.armor(box, 2, function (i) { return i % 2 === 0; });
      var inside = K.z(K.grid(280, 620, 4, 3, 54, 70, true), function (i) { return i % 2 === 0; }); K.b(inside, [3]);
      var halo = K.z(K.ring(360, 690, 250, 32, 0.3), function (i) { return i % 3 === 1; }); K.g(halo, [6, 24]); K.armor(halo, 2, function (i) { return i % 6 === 4; });
      return { pegs: K.tidy(K.join(box, inside, halo), { tight: true }) };
    } },
  63: { name: 'Verzerrtes Gitter', en: 'Warped Grid', desc: 'Ein Gitter, von einer Welle verbogen', descEn: 'A grid bent by a wave', scene: ['galaxy', 160], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var g = K.grid(100, 300, 11, 10, 52, 78).map(function (p) { return { x: p.x + 28 * Math.sin(p.y / 90), y: p.y + 20 * Math.sin(p.x / 70) }; });
      K.z(g, function (i, p) { return (Math.round(p.x / 52) + Math.round(p.y / 78)) % 4 === 0; }); K.armor(g, 2, function (i) { return i % 7 === 3; });
      K.g(g, [15, 60]); K.b(g, [40]);
      return { pegs: K.tidy(g), wells: [K.well(360, 690, 100, 1100)] };
    } },
  64: { name: 'Zwei Kammern', en: 'Two Chambers', desc: 'Zwei Mauerkammern, nur Tore führen hinein', descEn: 'Two walled chambers, only gates lead in', scene: ['deep', 290], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      function cham(x0, y0, w, h) { return K.path([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]], 27, true); }
      var c1 = K.armor(cham(100, 340, 220, 200), 2, function (i) { return i % 2 === 0; }), c2 = K.armor(cham(400, 780, 220, 200), 2, function (i) { return i % 2 === 0; });
      var o1 = c1.filter(function (p) { return !(p.y > 530 && Math.abs(p.x - 210) < 30); }), o2 = c2.filter(function (p) { return !(p.y < 790 && Math.abs(p.x - 510) < 30); });
      var in1 = K.z(K.grid(150, 400, 3, 2, 60, 70, true), [0, 1, 2, 3]), in2 = K.z(K.grid(450, 840, 3, 2, 60, 70, true), [0, 1, 2, 3]); K.b(in2, [4]);
      var G = [K.gates(620, 300, 210, 440), K.gates(80, 1060, 510, 880)];
      var mid = K.z(K.row(130, 660, 590, 660, 10), [0, 2, 4, 6, 8]); K.g(mid, [5, 9]); K.b(mid, [3]);
      var tops = K.z(K.join(K.row(420, 360, 620, 360, 5), K.row(100, 1000, 300, 1000, 5)), [0, 2, 4, 5, 7, 9]);
      return { pegs: K.tidy(K.join(o1, o2, in1, in2, mid, tops), { tight: true, gates: G }), gatePairs: G };
    } },
  65: { name: 'Sanduhr', en: 'Hourglass', desc: 'Eine Sanduhr, an der Taille schwingt eine Bahn', descEn: 'An hourglass with a swinging rail at the waist', scene: ['comet', 50], items: ['bomb', 'laser', 'chain', 'warp'],
    build: function (K) {
      var glass = K.join(K.row(120, 300, 320, 660, 9), K.row(600, 300, 400, 660, 9), K.row(320, 760, 120, 1100, 9), K.row(400, 760, 600, 1100, 9));
      K.z(glass, function (i) { return i % 3 === 2; }); K.armor(glass, 2, function (i) { return i % 6 === 0; });
      var sandT = K.z(K.grid(260, 320, 4, 3, 66, 60, true), [0, 2, 5]), sandB = K.z(K.grid(250, 980, 5, 2, 56, 60, true), [1, 3, 6]); K.g(sandT, [3]); K.b(sandB, [4]);
      var rails = [K.rail('arc', 360, 650, { w: 150, rot: Math.PI, hang: 60, z: 2, g: 1, swing: { a: 0.4, w: 0.9 } })];
      return { pegs: K.tidy(K.join(glass, sandT, sandB), { rails: rails }), stoneRails: rails };
    } },
  66: { name: 'Spiegelbild', en: 'Mirror Image', desc: 'Links ein Muster, rechts versetzt gespiegelt', descEn: 'A pattern on the left, mirrored and shifted on the right', scene: ['wormhole', 120], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var left = K.join(K.arc(170, 450, 110, -2.4, 0.8, 9), K.row(80, 700, 280, 860, 5), K.ring(180, 1000, 60, 8));
      K.z(left, function (i) { return i % 3 === 0; }); K.armor(left, 2, function (i) { return i % 5 === 2; });
      var right = K.move(K.mirror(left), 0, 150); K.g(left, [4]); K.b(right, [7]); K.g(right, [12]);
      var spine = K.armor(K.row(360, 330, 360, 1050, 16), 2, function (i) { return i % 3 === 0; }); K.z(spine, [2, 8, 14]);
      return { pegs: K.tidy(K.join(left, right, spine)) };
    } },
  67: { name: 'Pulsschlag', en: 'Heartbeat', desc: 'Drei Ringe atmen ein und aus', descEn: 'Three rings breathe in and out', scene: ['pulsar', 330], items: ['bomb', 'laser', 'chain', 'warp'],
    build: function (K) {
      var r1 = K.z(K.pulse(360, 660, 90, 10, 0.25, 18, 1.1), [0, 5]), r2 = K.z(K.pulse(360, 660, 175, 20, -0.18, 18, 1.1), [2, 7, 12, 17]), r3 = K.z(K.pulse(360, 660, 265, 30, 0.12, 0, 1, 0.3), function (i) { return i % 4 === 1; });
      K.armor(r2, 2, [4, 14]); K.armor(r3, 2, function (i) { return i % 8 === 3; }); K.g(r2, [9]); K.g(r3, [12]); K.b(r1, [3]);
      var heart = K.armor(K.z([{ x: 360, y: 660 }], [0]), 3);
      var beat = K.z(K.path([[90, 1090], [230, 1090], [280, 1030], [340, 1130], [400, 1030], [450, 1090], [630, 1090]], 46), [1, 5, 9]);
      return { pegs: K.tidy(K.join(heart, r1, r2, r3, beat)) };
    } },
  68: { name: 'Ziegeltürme', en: 'Brick Towers', desc: 'Drei Türme aus dichten Steinen, Erz auf den Zinnen', descEn: 'Three towers of tight rocks, ore on the battlements', scene: ['lava', 350], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var towers = [];
      [[150, 520], [360, 380], [570, 600]].forEach(function (t, i) {
        var col = K.join(K.row(t[0] - 13, t[1], t[0] - 13, 1080, Math.round((1080 - t[1]) / 26) + 1), K.row(t[0] + 13, t[1] + 13, t[0] + 13, 1067, Math.round((1054 - t[1]) / 26) + 1));
        K.armor(col, 2, function (k) { return k % 4 === 1; }); towers = towers.concat(col.filter(function (p, k) { return k % 9 !== 4; }));
        towers = towers.concat(K.z(K.row(t[0] - 46, t[1] - 46, t[0] + 46, t[1] - 46, 3), [0, 1, 2]));
      });
      var flags = K.z(K.join(K.row(255, 300, 255, 560, 6), K.row(465, 300, 465, 560, 6)), [0, 1, 3, 4, 6, 7, 9, 10]);
      var yard = K.z(K.join(K.row(90, 260, 200, 260, 3), K.row(520, 260, 630, 260, 3)), [0, 2, 3, 5]); K.g(flags, [2, 9]); K.b(flags, [6]);
      return { pegs: K.tidy(K.join(towers, flags, yard), { tight: true }) };
    } },
  69: { name: 'Lichtkrümmung', en: 'Light Bend', desc: 'Bögen drehen sich um ein Feld, das Licht biegt', descEn: 'Arcs turn around a field that bends light', scene: ['blackhole', 40], items: ['bomb', 'laser', 'chain', 'swarm', 'warp'],
    build: function (K) {
      var arcs = []; for (var k = 0; k < 4; k++) arcs = arcs.concat(K.z(K.arc(360, 660, 200, k * Math.PI / 2 + 0.25, k * Math.PI / 2 + 1.3, 6), [0, 3]));
      arcs = K.spin(arcs, 360, 660, 0.2); K.armor(arcs, 2, function (i) { return i % 6 === 5; }); K.g(arcs, [2, 14]);
      var outer = K.z(K.ring(360, 660, 310, 40, 0.35), function (i) { return i % 4 === 2; }); K.b(outer, [9]);
      var rails = [K.rail('ring', 360, 660, { R: 95, gap: 0.5, z: 3, g: 1, spin: -0.4 })];
      return { pegs: K.tidy(K.join(arcs, outer), { rails: rails }), stoneRails: rails, wells: [K.well(360, 660, 60, 900)] };
    } },
  70: { name: 'Schwarzes Loch', en: 'Black Hole', desc: 'Finale: Spiralarme stürzen in ein Schwarzes Loch, ein Mauerring schützt den Kern', descEn: 'Finale: spiral arms plunge into a black hole, a brick ring guards the core', scene: ['blackhole', 20], items: ['bomb', 'laser', 'chain', 'swarm', 'drill', 'warp', 'extra'],
    build: function (K) {
      var arms = []; for (var k = 0; k < 3; k++) arms = arms.concat(K.z(K.spiral(360, 660, 150, 100, 1.2, 46, k * 2.094), function (i) { return i % 6 === 3; }));
      arms = K.spin(arms, 360, 660, 0.09); K.g(arms, [3, 18]);
      var wall = K.armor(K.ring(360, 660, 95, 23), 2, 2); var wallG = wall.filter(function (p, i) { return i % 4 !== 0; });
      var core = K.g(K.ring(360, 660, 42, 5), [0, 2]); var bonus = K.b([{ x: 360, y: 660 }], [0]);
      var rails = [K.rail('ring', 360, 660, { R: 300, gap: 0.75, z: 4, g: 1 })];   // großer Ring steht still: die Lücke unten bleibt unten (ein pendelnder Ring hielt die Drohne in der Schale fest)
      return { pegs: K.tidy(K.join(core, bonus, wallG, arms), { rails: rails, tight: true }), stoneRails: rails };
    } },

  /* ===== Welt 8 – Kristallkammer: Karussell, Doppelhelix ===== */
  71: { name: 'Karussell', en: 'Carousel', desc: 'Ein drehender Steinring mit Lücke', descEn: 'A spinning stone ring with a gap', scene: ['deep', 180], items: ['bomb', 'laser', 'chain', 'warp'],
    build: function (K) {
      var rails = [K.rail('ring', 360, 640, { R: 140, gap: 0.55, z: 4, g: 1, spin: 0.45 })];
      var inner = K.z(K.grid(300, 590, 3, 3, 60, 50, true), [0, 2, 4, 6]); K.b(inner, [7]);
      var crystals = []; [[120, 330], [600, 330], [120, 960], [600, 960]].forEach(function (p, i) { crystals = crystals.concat(K.z(K.diamond(p[0], p[1], 100, 150, 44), [0, 3])); });
      K.armor(crystals, 2, function (i) { return i % 6 === 2; }); K.g(crystals, [5, 20]);
      var bars = K.z(K.join(K.row(260, 280, 460, 280, 5), K.row(260, 1050, 460, 1050, 5)), [0, 2, 4, 5, 7, 9]);
      return { pegs: K.tidy(K.join(inner, crystals, bars), { rails: rails }), stoneRails: rails };
    } },
  72: { name: 'Doppelhelix', en: 'Double Helix', desc: 'Zwei Stränge winden sich umeinander', descEn: 'Two strands wind around each other', scene: ['nebula', 120], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var a = K.row(360, 300, 360, 1060, 17), b = K.row(360, 323, 360, 1083, 17).map(function (p) { return { x: p.x, y: p.y }; });
      var s1 = K.wobble(K.z(a.map(function (p) { return { x: p.x, y: p.y }; }), function (i) { return i % 3 === 0; }), 130, 0.7, 0.012);
      var s2 = K.wobble(K.z(b, function (i) { return i % 3 === 1; }), 130, 0.7, 0.012).map(function (p) { p.mv.a0 += Math.PI; return p; });
      K.g(s1, [7]); K.b(s2, [9]);
      var sides = K.sym(K.armor(K.z(K.row(60, 340, 60, 1020, 14), [2, 6, 10]), 2, [4, 8, 12])); K.g(sides, [0]);
      return { pegs: K.tidy(K.join(s1, s2, sides)) };
    } },
  73: { name: 'Kristallgitter', en: 'Crystal Lattice', desc: 'Ein schräges Rautengitter, gepanzerte Knoten', descEn: 'A slanted rhombus lattice with armored nodes', scene: ['pillars', 200], items: ['bomb', 'laser', 'chain', 'warp'],
    build: function (K) {
      var g = K.rot(K.grid(80, 330, 13, 13, 50, 50), 360, 650, Math.PI / 4).filter(function (p) { return p.x > 70 && p.x < 650 && p.y > 300 && p.y < 1090 && Math.abs(p.x - 360) + Math.abs(p.y - 690) * 0.75 < 330; });
      K.z(g, function (i, p) { return Math.round((p.x + p.y) / 70) % 6 === 0; }); K.armor(g, 2, function (i, p) { return Math.round((p.x - p.y) / 70) % 8 === 0; });
      K.g(g, [10, 50]); K.b(g, [30]);
      var top = K.z(K.row(200, 250, 520, 250, 7), [1, 3, 5]);
      return { pegs: K.tidy(K.join(top, g)) };
    } },
  74: { name: 'Prisma', en: 'Prism', desc: 'Ein Dreieck bricht das Licht in Strahlen', descEn: 'A triangle splits light into rays', scene: ['binary', 40], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var tri = K.path([[360, 300], [520, 580], [200, 580]], 46, true); K.armor(tri, 2, function (i) { return i % 4 === 0; }); K.z(tri, function (i) { return i % 2 === 1; });
      var rays = []; [-0.55, -0.2, 0.15, 0.5].forEach(function (a, i) { var r = K.row(360 + Math.sin(a) * 300, 680, 360 + Math.sin(a) * 600, 1080, 8); K.z(r, [1, 4, 7]); rays = rays.concat(r); });
      K.g(rays, [3, 21]); K.b(rays, [12]);
      var beam = K.z(K.row(100, 300, 260, 460, 4), [0, 3]);
      return { pegs: K.tidy(K.join(tri, rays, beam)), wells: [K.well(360, 490, 70, 1200)] };
    } },
  75: { name: 'Kristallblüte', en: 'Crystal Bloom', desc: 'Eine Blüte dreht sich, in der Mitte ein kleines Karussell', descEn: 'A bloom turns with a small carousel in the middle', scene: ['galaxy', 300], items: ['bomb', 'laser', 'chain', 'gravity'],
    build: function (K) {
      var bloom = K.spin(K.z(rose(360, 660, 270, 3, 46), function (i) { return i % 2 === 0; }), 360, 660, 0.12); K.armor(bloom, 2, function (i) { return i % 6 === 2; }); K.g(bloom, [4, 16]); K.b(bloom, [10]);
      var rails = [K.rail('ring', 360, 660, { R: 60, gap: 0.6, z: 2, g: 1, spin: -0.7 })];
      var corners = K.z(K.join(K.ring(100, 270, 40, 5), K.ring(620, 270, 40, 5), K.ring(100, 1080, 40, 5), K.ring(620, 1080, 40, 5)), [0, 5, 10, 15]);
      return { pegs: K.tidy(K.join(bloom, corners), { rails: rails }), stoneRails: rails };
    } },
  76: { name: 'Facetten', en: 'Facets', desc: 'Reihen kleiner Kristalle, einige mit Panzer', descEn: 'Rows of small crystals, some armored', scene: ['deep', 170], items: ['bomb', 'laser', 'chain', 'warp'],
    build: function (K) {
      var c = []; for (var r = 0; r < 4; r++) for (var q = 0; q < 4 - (r % 2); q++) { var d = K.diamond(140 + q * 150 + (r % 2 ? 75 : 0), 330 + r * 190, 90, 130, 44); K.z(d, [r % 2 ? 0 : 2]); if ((r + q) % 3 === 1) K.armor(d, 2, [1, 3]); c = c.concat(d); }
      K.g(c, [5, 33]); K.b(c, [18]);
      var rails = [K.rail('wave', 360, 1060, { w: 480, amp: 28, waves: 2, ph: Math.PI, z: 3, g: 0 })];
      return { pegs: K.tidy(c, { rails: rails }), stoneRails: rails };
    } },
  77: { name: 'Doppelkarussell', en: 'Twin Carousel', desc: 'Zwei Steinringe drehen gegeneinander', descEn: 'Two stone rings turn against each other', scene: ['pulsar', 260], items: ['bomb', 'laser', 'chain', 'swarm', 'gravity'],
    build: function (K) {
      var rails = [K.rail('ring', 210, 520, { R: 100, gap: 0.55, z: 3, g: 1, spin: 0.5 }), K.rail('ring', 510, 840, { R: 100, gap: 0.55, z: 3, g: 0, spin: -0.5 })];
      var hubs = K.z(K.join(K.ring(210, 520, 40, 5), K.ring(510, 840, 40, 5)), [0, 2, 5, 7]); K.b(hubs, [3]);
      var bridge = K.z(K.row(120, 1060, 400, 760, 8), [1, 4, 7]); K.armor(bridge, 2, [2, 5]);
      var top = K.z(K.arc(510, 520, 140, -Math.PI + 0.3, 0.2, 9), [0, 4, 8]); K.g(top, [2]);
      var low = K.z(K.arc(210, 840, 140, 0.1, Math.PI + 0.1, 9), [1, 5, 8]); K.armor(low, 2, [3]);
      return { pegs: K.tidy(K.join(hubs, bridge, top, low), { rails: rails }), stoneRails: rails };
    } },
  78: { name: 'Eisnadeln', en: 'Ice Needles', desc: 'Lange Nadeln von oben und unten, schief versetzt', descEn: 'Long needles from above and below, offset', scene: ['moon', 200], items: ['bomb', 'laser', 'chain', 'gravity'],
    build: function (K) {
      var nd = []; [[110, 0], [230, 1], [350, 0], [470, 1], [590, 0]].forEach(function (n, i) {
        var len = [430, 520, 380, 600, 460][i], up = n[1] === 1, y0 = up ? 1100 : 280, y1 = up ? 1100 - len : 280 + len;
        var col = K.row(n[0], y0, n[0], y1, Math.round(len / 46) + 1); K.z(col, [col.length - 1, Math.floor(col.length / 2), 2, col.length - 3]); K.armor(col, 2, function (k) { return k % 4 === 1; });
        nd = nd.concat(col);
      });
      K.g(nd, [5, 30]); K.b(nd, [17]);
      return { pegs: K.tidy(nd), wells: [K.well(290, 690, 70, -1200), K.well(530, 690, 70, -1200)] };
    } },
  79: { name: 'Spiegelsaal', en: 'Hall of Mirrors', desc: 'Vier gespiegelte Viertel, Tore verbinden die Ecken', descEn: 'Four mirrored quarters, gates link the corners', scene: ['nebula', 50], items: ['bomb', 'laser', 'chain', 'swarm', 'warp'],
    build: function (K) {
      var q = K.join(K.arc(220, 470, 120, Math.PI + 0.2, 1.5 * Math.PI + 0.6, 6), K.row(120, 610, 300, 610, 5), [{ x: 220, y: 470 }]);
      K.z(q, [0, 2, 4, 6, 8, 10]); K.armor(q, 2, [3, 7]);
      var half = K.join(q, K.mirror(q)), all = K.join(half, half.map(function (p) { return Object.assign({}, p, { y: 1320 - p.y }); }));
      K.g(all, [4, 30]); K.b(all, [17]);
      var G = [K.gates(80, 300, 640, 1040), K.gates(640, 300, 80, 1040)];
      var rails = [K.rail('ring', 360, 660, { R: 70, gap: 0.6, z: 2, g: 1, spin: 0.5 })];
      return { pegs: K.tidy(all, { gates: G, rails: rails }), gatePairs: G, stoneRails: rails };
    } },
  80: { name: 'Kristall-Zitadelle', en: 'Crystal Citadel', desc: 'Finale: ein Kristall im Karussell, Helix-Türme, Tore', descEn: 'Finale: a crystal inside a carousel, helix towers, gates', scene: ['pillars', 180], items: ['bomb', 'laser', 'chain', 'swarm', 'gravity', 'warp', 'extra'],
    build: function (K) {
      var crystal = K.diamond(360, 640, 150, 230, 44).filter(function (p) { return p.y < 700; }); K.z(crystal, [0]);
      var heart = K.b([{ x: 360, y: 640 }], [0]);
      var rails = [K.rail('ring', 360, 640, { R: 200, gap: 0.5, z: 5, g: 1, spin: 0.25 })];
      var tL = K.wobble(K.z(K.row(80, 330, 80, 980, 14), function (i) { return i % 3 === 0; }), 22, 0.8, 0.02), tR = K.wobble(K.z(K.row(640, 330, 640, 980, 14), function (i) { return i % 3 === 1; }), 22, 0.8, 0.02);
      K.g(tL, [4]); K.g(tR, [10]);
      var crown = K.z(K.row(200, 260, 520, 260, 8), [1, 3, 5, 7]); K.armor(crown, 2, [0, 7]);
      var base = K.z(K.row(200, 1090, 520, 1090, 8), [0, 2, 4, 6]); K.g(base, [5]);
      var G = [K.gates(200, 960, 520, 340), K.gates(520, 960, 200, 340)];
      return { pegs: K.tidy(K.join(heart, crystal, tL, tR, crown, base), { rails: rails, gates: G }), stoneRails: rails, gatePairs: G };
    } },
  /* ===== Welt 9 – Sturmfeld: wandernde Felder, Förderbänder ===== */
  81: { name: 'Sturmfront', en: 'Storm Front', desc: 'Schräge Regenstreifen, ein Feld zieht durch', descEn: 'Slanted streaks of rain, a field drifts through', scene: ['nebula', 210], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var rain = []; for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) { var x = 110 + c * 150 + (r % 2) * 70, y = 290 + r * 170; rain = rain.concat(K.z(K.row(x, y, x + 60, y + 100, 3), [1])); }
      K.armor(rain, 2, function (i) { return i % 11 === 3; }); K.g(rain, [10, 40]); K.b(rain, [25]);
      return { pegs: K.tidy(rain), wells: [K.well(360, 600, 110, 1300, { type: 'lis', x: 360, y: 640, ax: 200, ay: 150, w: 0.25, a0: 0, b: 2, ph: 0 })] };
    } },
  82: { name: 'Förderband', en: 'Conveyor', desc: 'Zwei Bänder tragen die Drohne quer übers Feld', descEn: 'Two belts carry the drone across the field', scene: ['deep', 190], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var rails = [K.rail('bar', 300, 520, { w: 380, rot: 0.12, belt: 260, z: 3, g: 1 }), K.rail('bar', 420, 860, { w: 380, rot: -0.12, belt: -260, z: 3, g: 0 })];
      var top = K.z(K.arc(360, 560, 330, -Math.PI / 2 - 0.8, -Math.PI / 2 + 0.8, 13), [0, 3, 6, 9, 12]); K.armor(top, 2, [4, 8]);
      var right = K.z(K.grid(520, 600, 3, 3, 50, 50, true), [0, 3, 6]); K.b(right, [4]);
      var left = K.z(K.grid(90, 960, 3, 3, 50, 50, true), [1, 4, 7]); K.g(left, [3]);
      var floor = K.z(K.row(250, 1110, 470, 1110, 5), [0, 2, 4]);
      return { pegs: K.tidy(K.join(top, right, left, floor), { rails: rails }), stoneRails: rails };
    } },
  83: { name: 'Blitzableiter', en: 'Lightning Rod', desc: 'Ein Blitz im Zickzack, zwei Abstoßer wandern', descEn: 'A zigzag bolt, two repulsors roam', scene: ['pulsar', 220], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var bolt = K.path([[420, 270], [300, 470], [430, 520], [300, 760], [440, 800], [330, 1080]], 46);
      K.z(bolt, function (i) { return i % 3 === 1; }); K.armor(bolt, 2, function (i) { return i % 6 === 4; }); K.g(bolt, [6]); K.b(bolt, [14]);
      var rods = K.z(K.join(K.row(100, 330, 100, 1000, 15), K.row(620, 330, 620, 1000, 15)), function (i) { return i % 4 === 2; }); K.g(rods, [21]);
      return { pegs: K.tidy(K.join(bolt, rods)), wells: [K.well(200, 500, 80, -1500, { type: 'slide', x0: 200, x1: 200, y0: 420, y1: 900, w: 0.35, a0: 0 }), K.well(520, 800, 80, -1500, { type: 'slide', x0: 520, x1: 520, y0: 420, y1: 900, w: 0.35, a0: Math.PI })] };
    } },
  84: { name: 'Hagelschauer', en: 'Hailstorm', desc: 'Eine Hagelwolke über zwei Bändern', descEn: 'A hail cloud above two belts', scene: ['nebula', 220], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var cloud = K.grid(140, 290, 9, 6, 55, 50, true).filter(function (p) { return Math.hypot((p.x - 360) / 260, (p.y - 420) / 150) < 1; });
      K.z(cloud, function (i) { return i % 3 === 1; }); K.armor(cloud, 2, function (i) { return i % 5 === 3; }); K.g(cloud, [8]); K.b(cloud, [20]);
      var hail = K.z(K.join(K.row(150, 700, 150, 850, 4), K.row(360, 680, 360, 830, 4), K.row(570, 700, 570, 850, 4)), [3, 7, 11]);
      var rails = [K.rail('bar', 230, 980, { w: 260, rot: 0.1, belt: 220, z: 2, g: 1 }), K.rail('bar', 490, 1060, { w: 260, rot: -0.1, belt: -220, z: 2, g: 0 })];
      return { pegs: K.tidy(K.join(cloud, hail), { rails: rails }), stoneRails: rails };
    } },
  85: { name: 'Auge des Sturms', en: 'Eye of the Storm', desc: 'Ruhiges Auge, außen kreisen zwei Felder', descEn: 'A calm eye, two fields circle outside', scene: ['galaxy', 200], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var eye = K.z(K.ring(360, 660, 70, 9), [0, 3, 6]); K.b(eye, [4]);
      var wall = K.z(K.ring(360, 660, 150, 20, 0.35), function (i) { return i % 2 === 0; }); K.armor(wall, 2, function (i) { return i % 4 === 1; });
      var bands = K.z(K.join(K.arc(360, 660, 300, -2.6, -0.55, 12), K.arc(360, 660, 300, 0.55, 2.6, 12)), function (i) { return i % 3 === 0; }); K.g(bands, [4, 17]);
      return { pegs: K.tidy(K.join(eye, wall, bands)), wells: [K.well(360, 430, 70, 1300, { cx: 360, cy: 660, rad: 230, a0: -Math.PI / 2, w: 0.3 }), K.well(360, 890, 70, -1300, { cx: 360, cy: 660, rad: 230, a0: Math.PI / 2, w: 0.3 })] };
    } },
  86: { name: 'Wirbelschleppe', en: 'Wake Vortex', desc: 'Zwei Wirbel, ein Band schleppt dazwischen', descEn: 'Two vortices with a belt dragging between them', scene: ['wormhole', 140], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var v1 = K.spin(K.z(K.spiral(200, 430, 30, 60, 1.6, 46, 0), function (i) { return i % 2 === 1; }), 200, 430, 0.35), v2 = K.spin(K.z(K.spiral(520, 900, 30, 60, 1.6, 46, Math.PI), function (i) { return i % 2 === 1; }), 520, 900, -0.35);
      K.g(v1, [3]); K.g(v2, [5]);
      var rails = [K.rail('bar', 380, 660, { w: 320, rot: -0.55, belt: 240, z: 3, g: 1 })];
      var side = K.z(K.join(K.row(560, 300, 640, 420, 3), K.row(80, 900, 160, 1020, 3)), [0, 2, 3, 5]); K.b(side, [1]);
      var mid = K.armor(K.z(K.row(130, 640, 230, 640, 3), [1]), 2, [0, 2]);
      return { pegs: K.tidy(K.join(v1, v2, side, mid), { rails: rails }), stoneRails: rails };
    } },
  87: { name: 'Windkanal', en: 'Wind Tunnel', desc: 'Zwei Säulen, Bänder schieben hin und her', descEn: 'Two pillars, belts push back and forth', scene: ['deep', 190], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var cols = K.z(K.join(K.row(80, 300, 80, 1080, 17), K.row(640, 300, 640, 1080, 17)), function (i) { return i % 4 === 1; }); K.armor(cols, 2, function (i) { return i % 4 === 3; }); K.g(cols, [8, 25]);
      var rails = [K.rail('bar', 300, 460, { w: 220, belt: 300, z: 2, g: 0 }), K.rail('bar', 420, 700, { w: 220, belt: -300, z: 2, g: 1 }), K.rail('bar', 300, 940, { w: 220, belt: 300, z: 2, g: 0 })];
      var beads = K.z(K.join(K.row(220, 330, 500, 330, 6), K.row(220, 580, 500, 580, 6), K.row(220, 820, 500, 820, 6), K.row(220, 1070, 500, 1070, 6)), [0, 2, 4, 6, 11, 12, 17, 18, 23]); K.b(beads, [9]);
      return { pegs: K.tidy(K.join(cols, beads), { rails: rails }), stoneRails: rails };
    } },
  88: { name: 'Gewitterzellen', en: 'Thunder Cells', desc: 'Vier Zellen, in jeder ein wanderndes Feld', descEn: 'Four cells, each with a roaming field', scene: ['nebula', 260], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var cells = [], wells = [];
      [[200, 430], [520, 430], [200, 860], [520, 860]].forEach(function (c, i) {
        var r = K.z(K.ring(c[0], c[1], 115, 15, 0.4, i < 2 ? -Math.PI / 2 : Math.PI / 2), function (k) { return k % 3 === i % 3; }); K.armor(r, 2, function (k) { return k % 5 === 2; }); cells = cells.concat(r);
        wells.push(K.well(c[0], c[1], 55, i % 2 ? -1100 : 1100, { type: 'lis', x: c[0], y: c[1], ax: 30, ay: 20, w: 0.5 + i * 0.1, a0: i, b: 2, ph: 0 }));
      });
      K.g(cells, [5, 30]); K.b(cells, [18]);
      var spine = K.z(K.row(360, 300, 360, 1060, 9), [1, 4, 7]);
      return { pegs: K.tidy(K.join(cells, spine)), wells: wells };
    } },
  89: { name: 'Wetterfront', en: 'Weather Front', desc: 'Wellenreihen schieben sich gegeneinander', descEn: 'Rows of waves push against each other', scene: ['moon', 300], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var w = []; [300, 440, 580, 720, 860].forEach(function (y, i) { var r = K.z(K.wave(120, 600, y, 26, 1.5, 11, i), function (k) { return k % 3 === i % 3; }); if (i % 2) r = K.slide(r, 45, 0, 0.4, i); else K.armor(r, 2, [5]); w = w.concat(r); });
      K.g(w, [4, 30]); K.b(w, [20]);
      var rails = [K.rail('wave', 360, 1030, { w: 480, amp: 30, waves: 2, ph: Math.PI, z: 3, g: 1 })];
      return { pegs: K.tidy(w, { rails: rails }), stoneRails: rails, wells: [K.well(70, 650, 60, 1200, { type: 'slide', x0: 70, x1: 650, y0: 650, y1: 650, w: 0.2, a0: 0 })] };
    } },
  90: { name: 'Chaos-Maschine', en: 'Chaos Engine', desc: 'Finale: Zahnräder, Förderbänder, ein Pendel und wandernde Felder', descEn: 'Finale: gears, belts, a pendulum and roaming fields', scene: ['pulsar', 30], items: ['bomb', 'laser', 'chain', 'swarm', 'split', 'extra'],
    build: function (K) {
      function gear(cx, cy, R, w) { var g = K.join(K.ring(cx, cy, R, Math.round(2 * Math.PI * R / 46)), K.ring(cx, cy, R + 40, 8)); return K.spin(K.z(g, function (i) { return i % 3 === 0; }), cx, cy, w); }
      var g1 = gear(200, 430, 80, 0.4), g2 = gear(520, 430, 80, -0.4); K.g(g1, [4]); K.g(g2, [7]);
      var rails = [K.rail('bar', 360, 700, { w: 360, belt: 260, z: 3, g: 1 }), K.rail('arc', 360, 760, { w: 200, rot: Math.PI, hang: 180, z: 3, g: 0, swing: { a: 0.35, w: 0.8 } })];
      var piston = K.z(K.slide(K.row(120, 1080, 280, 1080, 4), 0, 40, 0.7), [0, 3]), piston2 = K.z(K.slide(K.row(440, 1080, 600, 1080, 4), 0, 40, 0.7, Math.PI), [0, 3]); K.b(piston2, [1]);
      var cores = K.armor(K.z([{ x: 200, y: 430 }, { x: 520, y: 430 }], [0, 1]), 2);
      return { pegs: K.tidy(K.join(cores, g1, g2, piston, piston2), { rails: rails }), stoneRails: rails, wells: [K.well(360, 560, 60, -1300, { type: 'slide', x0: 300, x1: 420, y0: 560, y1: 560, w: 0.6, a0: 0 })] };
    } },

  /* ===== Welt 10 – Schmelzzone: Wippen, Bahnen, die sich öffnen und schließen ===== */
  91: { name: 'Die Wippe', en: 'The Seesaw', desc: 'Ein Steinbalken kippt hin und her', descEn: 'A stone beam tips back and forth', scene: ['lava', 20], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var rails = [K.rail('bar', 360, 640, { w: 340, z: 3, g: 1, swing: { a: 0.35, w: 0.7 } })];
      var pivot = K.armor([{ x: 360, y: 700 }], 3);
      var ends = K.z(K.join(K.ring(130, 760, 60, 8), K.ring(590, 760, 60, 8)), [0, 3, 6, 8, 11, 14]); K.b(ends, [2]); K.g(ends, [10]);
      var top = K.z(K.row(130, 320, 590, 320, 11), [0, 2, 4, 6, 8, 10]); K.armor(top, 2, [3, 7]);
      var low = K.z(K.wave(110, 610, 1050, 24, 2, 11), [1, 5, 9]);
      return { pegs: K.tidy(K.join(pivot, ends, top, low), { rails: rails }), stoneRails: rails };
    } },
  92: { name: 'Hochofen', en: 'Blast Furnace', desc: 'Ofentüren öffnen und schließen sich', descEn: 'Furnace doors open and close', scene: ['lava', 350], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var shell = K.armor(K.path([[160, 1060], [160, 500], [250, 380], [470, 380], [560, 500], [560, 1060]], 46), 2, function (i) { return i % 2 === 0; });
      var fire = K.z(K.grid(250, 700, 5, 5, 55, 60, true), [0, 2, 4, 6]); K.g(fire, [5]); K.b(fire, [11]);
      var rails = [K.rail('bar', 280, 580, { w: 140, z: 1, g: 0, hang: 0, swing: { a: 0.6, w: 0.6 } }), K.rail('bar', 440, 580, { w: 140, z: 1, g: 1, swing: { a: 0.6, w: 0.6, p: Math.PI } })];
      var chimney = K.z(K.row(360, 270, 360, 330, 2), [0, 1]);
      var sides = K.z(K.join(K.row(70, 400, 70, 1000, 7), K.row(650, 400, 650, 1000, 7)), [1, 3, 8, 10]);
      return { pegs: K.tidy(K.join(shell, fire, chimney, sides), { rails: rails }), stoneRails: rails };
    } },
  93: { name: 'Schmelztiegel', en: 'Crucible', desc: 'Ein Tiegel zwischen zwei Wippen', descEn: 'A crucible between two seesaws', scene: ['sun', 15], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var pot = K.z(K.arc(360, 640, 180, 0.15, Math.PI - 0.15, 12), [0, 3, 6, 8, 11]); K.armor(pot, 2, [2, 9]);
      var melt = K.z(K.row(270, 720, 450, 720, 5), [0, 2, 4]); K.b(melt, [1]); K.g(melt, [3]);
      var rails = [K.rail('bar', 160, 460, { w: 200, z: 2, g: 1, swing: { a: 0.4, w: 0.9 } }), K.rail('bar', 560, 460, { w: 200, z: 2, g: 0, swing: { a: 0.4, w: 0.9, p: Math.PI } })];
      var sparks = K.z(K.join(K.arc(160, 460, 140, -2.6, -0.5, 6), K.arc(560, 460, 140, -2.6, -0.5, 6)), [0, 3, 6, 9]);
      var floor = K.z(K.row(120, 1060, 600, 1060, 11), [1, 4, 7, 10]);
      return { pegs: K.tidy(K.join(pot, melt, sparks, floor), { rails: rails }), stoneRails: rails };
    } },
  94: { name: 'Lavaströme', en: 'Lava Flows', desc: 'Drei Ströme fließen, dazwischen Felsinseln', descEn: 'Three flows run with rock islands between them', scene: ['lava', 40], items: ['bomb', 'laser', 'chain', 'split'],
    build: function (K) {
      var flows = []; [350, 650, 950].forEach(function (y, i) { var f = K.slide(K.z(K.wave(110, 610, y, 30, 1, 11, i), function (k) { return k % 3 === 1; }), 30, 0, 0.5, i * 2); flows = flows.concat(f); });
      K.g(flows, [3, 27]);
      var isl = []; [[200, 500], [520, 500], [360, 800]].forEach(function (c) { isl = isl.concat(K.armor(K.z(K.ring(c[0], c[1], 50, 7), [0, 3]), 2, [5])); });
      K.b(isl, [2]);
      return { pegs: K.tidy(K.join(flows, isl)), wells: [K.well(360, 1110, 80, -1300)] };
    } },
  95: { name: 'Gießerei', en: 'Foundry', desc: 'Drei Formen, darüber Wippen in einer Reihe', descEn: 'Three molds under a row of seesaws', scene: ['lava', 25], items: ['bomb', 'laser', 'chain', 'split', 'revive'],
    build: function (K) {
      var molds = []; [140, 360, 580].forEach(function (x, i) { var d = K.z(K.diamond(x, 860, 140, 200, 44), [0, 2, 4]); if (i === 1) K.armor(d, 2, [1, 3]); molds = molds.concat(d); });
      K.g(molds, [5]); K.b(molds, [12]);
      var rails = [K.rail('bar', 160, 520, { w: 170, z: 1, g: 0, swing: { a: 0.45, w: 0.8 } }), K.rail('bar', 360, 460, { w: 170, z: 2, g: 1, swing: { a: 0.45, w: 0.8, p: 2 } }), K.rail('bar', 560, 520, { w: 170, z: 1, g: 0, swing: { a: 0.45, w: 0.8, p: 4 } })];
      var ladle = K.z(K.arc(360, 270, 120, 0.2, Math.PI - 0.2, 7), [0, 3, 6]);
      return { pegs: K.tidy(K.join(molds, ladle), { rails: rails }), stoneRails: rails };
    } },
  96: { name: 'Schlackenhalde', en: 'Slag Heap', desc: 'Schlackenhügel, ein Ring öffnet und schließt sich', descEn: 'Slag mounds and a ring that opens and closes', scene: ['planet', 15], items: ['bomb', 'laser', 'chain', 'revive'],
    build: function (K) {
      var heaps = []; [[170, 1060], [460, 1060]].forEach(function (c) { heaps = heaps.concat(K.path([[c[0] - 110, c[1]], [c[0] + 50, c[1] - 260], [c[0] + 150, c[1]]], 46)); });
      K.z(heaps, function (i) { return i % 3 === 0; }); K.armor(heaps, 2, function (i) { return i % 3 === 2; });
      var rails = [K.rail('arc', 360, 520, { w: 220, rot: -Math.PI / 2, z: 2, g: 1, swing: { a: 0.45, w: 0.6 } }), K.rail('arc', 360, 520, { w: 220, rot: Math.PI / 2, z: 2, g: 0, swing: { a: 0.45, w: 0.6, p: Math.PI } })];
      var core = K.z(K.ring(360, 520, 40, 5), [0, 2, 4]); K.b(core, [1]);
      var top = K.z(K.row(120, 280, 600, 280, 10), [1, 4, 7]); K.g(top, [9]);
      return { pegs: K.tidy(K.join(heaps, core, top), { rails: rails }), stoneRails: rails };
    } },
  97: { name: 'Glutkern', en: 'Ember Core', desc: 'Ein gepanzerter Kern, Tore wechseln die Seite', descEn: 'An armored core, gates switch sides', scene: ['sun', 25], items: ['bomb', 'laser', 'chain', 'drill', 'revive'],
    build: function (K) {
      var core = K.z(K.ring(360, 660, 60, 8), [0, 2, 4, 6]); K.armor(core, 2, [1, 3, 5, 7]);
      var shell = K.armor(K.ring(360, 660, 140, 19, 0.4), 2, function (i) { return i % 2 === 0; }); K.z(shell, function (i) { return i % 4 === 1; });
      var outer = K.z(K.ring(360, 660, 260, 34, 0.3), function (i) { return i % 4 === 2; }); K.g(outer, [5, 22]); K.b(outer, [14]);
      var G = [K.gates(90, 280, 360, 520, { type: 'slide', x0: 90, x1: 630, y0: 280, y1: 280, w: 0.3, a0: 0 }), K.gates(630, 1070, 360, 800, { type: 'slide', x0: 90, x1: 630, y0: 1070, y1: 1070, w: 0.3, a0: Math.PI })];
      return { pegs: K.tidy(K.join(core, shell, outer), { gates: G }), gatePairs: G };
    } },
  98: { name: 'Kühlturm', en: 'Cooling Tower', desc: 'Zwei geschwungene Wände, unten ein Band', descEn: 'Two curved walls with a belt below', scene: ['deep', 15], items: ['bomb', 'laser', 'chain', 'revive'],
    build: function (K) {
      var wl = [], wr = []; for (var y = 300; y <= 1000; y += 47) { var dx = 70 + 110 * Math.pow((y - 650) / 350, 2); wl.push({ x: 360 - dx - 60, y: y }); wr.push({ x: 360 + dx + 60, y: y }); }
      var walls = K.join(wl, wr); K.z(walls, function (i) { return i % 4 === 1; }); K.armor(walls, 2, function (i) { return i % 8 === 4; }); K.g(walls, [6, 22]);
      var steam = K.z(K.join(K.ring(360, 450, 50, 7), K.ring(360, 700, 50, 7)), [0, 3, 7, 10]); K.b(steam, [5]);
      var rails = [K.rail('bar', 360, 1080, { w: 420, belt: 280, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(walls, steam), { rails: rails }), stoneRails: rails };
    } },
  99: { name: 'Feuerwalze', en: 'Fire Roller', desc: 'Ein Steinbalken dreht sich durch das Feld', descEn: 'A stone beam rotates across the field', scene: ['lava', 5], items: ['bomb', 'laser', 'chain', 'swarm', 'revive'],
    build: function (K) {
      var rails = [K.rail('bar', 360, 660, { w: 300, z: 3, g: 1, spin: 0.35 })];
      var ring = K.z(K.ring(360, 660, 230, 30, 0.3), function (i) { return i % 3 === 0; }); K.armor(ring, 2, function (i) { return i % 6 === 2; }); K.g(ring, [8]); K.b(ring, [18]);
      var corners = K.z(K.join(K.diamond(110, 280, 90, 120, 44), K.diamond(610, 280, 90, 120, 44), K.diamond(110, 1060, 90, 120, 44), K.diamond(610, 1060, 90, 120, 44)), function (i) { return i % 2 === 0; });
      return { pegs: K.tidy(K.join(ring, corners), { rails: rails }), stoneRails: rails };
    } },
  100: { name: 'Zahnrad-Giganten', en: 'Gear Giants', desc: 'Finale: zwei riesige Zahnräder greifen ineinander, dazwischen eine Wippe', descEn: 'Finale: two huge gears mesh, with a seesaw between', scene: ['sun', 30], items: ['bomb', 'laser', 'chain', 'swarm', 'split', 'revive', 'extra'],
    build: function (K) {
      function gear(cx, cy, R, w, ph) { var teeth = []; for (var k = 0; k < 12; k++) { var a = ph + k * Math.PI / 6; teeth.push({ x: cx + Math.cos(a) * (R + 38), y: cy + Math.sin(a) * (R + 38) }); } var g = K.join(K.ring(cx, cy, R, Math.round(2 * Math.PI * R / 46)), teeth); K.z(g, function (i) { return i % 3 === 0; }); K.armor(g, 2, function (i) { return i % 6 === 2; }); return K.spin(g, cx, cy, w); }
      var g1 = gear(220, 470, 105, 0.3, 0), g2 = gear(500, 850, 105, -0.3, 0.26); K.g(g1, [4]); K.g(g2, [9]);
      var hubs = K.armor(K.z(K.join(K.ring(220, 470, 40, 5), K.ring(500, 850, 40, 5)), [0, 2, 5, 7]), 2, [1, 6]);
      var rails = [K.rail('bar', 520, 420, { w: 190, z: 2, g: 1, swing: { a: 0.4, w: 0.8 } }), K.rail('bar', 200, 900, { w: 190, z: 2, g: 0, swing: { a: 0.4, w: 0.8, p: Math.PI } })];
      var bonus = K.b([{ x: 360, y: 660 }], [0]);
      return { pegs: K.tidy(K.join(hubs, g1, g2, bonus), { rails: rails }), stoneRails: rails };
    } },

  /* ===== Welt 11 – Geisterfeld: Geisterbrocken (blinken), wandernder Bonus-Brocken ===== */
  101: { name: 'Spukfeld', en: 'Haunted Field', desc: 'Ein Gitter, dessen Reihen abwechselnd verschwinden', descEn: 'A grid whose rows vanish in turn', scene: ['nebula', 270], items: ['bomb', 'laser', 'chain', 'revive'],
    build: function (K) {
      var rows = []; for (var r = 0; r < 8; r++) { var row = K.z(K.row(110, 300 + r * 100, 610, 300 + r * 100, 11), function (k) { return (k + r) % 5 === 1; }); if (r % 2) row = K.fade(row, 0.9, r); else K.armor(row, 2, [5]); rows = rows.concat(row); }
      K.g(rows, [10, 60]); K.b(rows, [40]);
      return { pegs: K.tidy(rows) };
    } },
  102: { name: 'Irrlicht', en: 'Will-o-the-Wisp', desc: 'Ein Bonus-Brocken irrt durchs Feld', descEn: 'A bonus rock wanders through the field', scene: ['deep', 280], items: ['bomb', 'laser', 'chain', 'revive'],
    build: function (K) {
      var wisp = K.slide(K.b([{ x: 360, y: 660 }], [0]), 260, 0, 0.35, 0);   // Irrlicht zieht quer durch die Mitte
      var arcs = []; [[180, 400], [540, 400], [180, 920], [540, 920]].forEach(function (c, i) { arcs = arcs.concat(K.z(K.arc(c[0], c[1], 110, i < 2 ? 0.3 : Math.PI + 0.3, i < 2 ? Math.PI - 0.3 : 2 * Math.PI - 0.3, 7), [0, 3, 6])); });
      K.armor(arcs, 2, function (i) { return i % 7 === 1; }); K.g(arcs, [2, 16]);
      var cross = K.fade(K.z(K.join(K.row(130, 560, 590, 560, 10), K.row(130, 760, 590, 760, 10)), function (i) { return i % 3 === 1; }), 1.0, 0, 0.6);
      var cols = K.z(K.join(K.row(360, 280, 360, 460, 4), K.row(360, 860, 360, 1100, 6)), [0, 3, 5, 9]);
      return { pegs: K.tidy(K.join(arcs, cross, cols, wisp)) };
    } },
  103: { name: 'Geisterschiff', en: 'Ghost Ship', desc: 'Ein Schiffsrumpf flackert, die Brücke bleibt', descEn: 'A ship hull flickers, the bridge stays', scene: ['wrecks', 260], items: ['bomb', 'laser', 'chain', 'revive'],
    build: function (K) {
      var hull = K.fade(K.z(K.ship(360, 640, 380, 46), function (i) { return i % 3 === 0; }), 0.7, 0, 0.3);
      var bridge = K.armor(K.z(K.ring(360, 520, 50, 7), [0, 2, 4]), 2, [1, 5]); K.g(bridge, [3]);
      var deck = K.z(K.row(360, 620, 360, 900, 7), [1, 4, 6]); K.b(deck, [2]);
      var waves = K.z(K.wave(90, 630, 1110, 22, 2.5, 13), [0, 4, 8, 12]);
      return { pegs: K.tidy(K.join(bridge, deck, hull, waves)) };
    } },
  104: { name: 'Nebelbank', en: 'Fog Bank', desc: 'Wellen aus Nebel tauchen auf und verschwinden', descEn: 'Waves of fog appear and disappear', scene: ['nebula', 180], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var fog = []; [320, 480, 640, 800, 960].forEach(function (y, i) { var w = K.z(K.wave(90, 630, y, 34, 1.5, 13, i * 0.8), function (k) { return k % 3 === i % 3; }); fog = fog.concat(i % 2 ? K.fade(w, 0.8, i * 1.3, 0.25) : w); });
      K.armor(fog, 2, function (i) { return i % 9 === 4; }); K.g(fog, [7, 40]); K.b(fog, [25]);
      var rails = [K.rail('arc', 360, 1100, { w: 300, z: 2, g: 0 })];
      return { pegs: K.tidy(fog, { rails: rails }), stoneRails: rails };
    } },
  105: { name: 'Totenstille', en: 'Dead Calm', desc: 'Nichts bewegt sich: ein Stern aus Sternen', descEn: 'Nothing moves: a star made of stars', scene: ['deep', 230], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var big = K.z(K.star(360, 660, 300, 130, 6, 46), function (i) { return i % 3 === 0; }); K.armor(big, 2, function (i) { return i % 6 === 2; }); K.g(big, [4, 22]);
      var small = []; for (var k = 0; k < 6; k++) { var a = -Math.PI / 2 + k * Math.PI / 3; small = small.concat(K.z(K.ring(360 + Math.cos(a) * 190, 660 + Math.sin(a) * 190, 30, 4), [0])); }
      var heart = K.b([{ x: 360, y: 660 }], [0]);
      return { pegs: K.tidy(K.join(heart, big, small)) };
    } },
  106: { name: 'Seelenwanderung', en: 'Wandering Souls', desc: 'Geisterspiralen drehen sich um ein Band', descEn: 'Ghost spirals turn around a belt', scene: ['galaxy', 250], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var s1 = K.fade(K.spin(K.z(K.spiral(360, 660, 60, 90, 1.6, 46, 0), function (i) { return i % 2 === 1; }), 360, 660, 0.2), 0.9, 0, 0.4), s2 = K.spin(K.z(K.spiral(360, 660, 60, 90, 1.6, 46, Math.PI), function (i) { return i % 3 === 0; }), 360, 660, 0.2);
      K.armor(s2, 2, [2, 7]); K.g(s1, [4]); K.g(s2, [5]);
      var rails = [K.rail('bar', 360, 1060, { w: 400, belt: -260, z: 3, g: 1 })];
      var lamp = K.z(K.row(160, 280, 560, 280, 9), [0, 2, 4, 6, 8]); K.b(lamp, [3]);
      return { pegs: K.tidy(K.join(s1, s2, lamp), { rails: rails }), stoneRails: rails };
    } },
  107: { name: 'Phantomtor', en: 'Phantom Gate', desc: 'Geisterringe um zwei Tore', descEn: 'Ghost rings around two gates', scene: ['gate', 280], items: ['bomb', 'laser', 'chain', 'swarm', 'phantom'],
    build: function (K) {
      var G = [K.gates(200, 430, 520, 890), K.gates(520, 430, 200, 890)];
      var rings = []; [[200, 430], [520, 430], [200, 890], [520, 890]].forEach(function (c, i) { var r = K.z(K.ring(c[0], c[1], 100, 13, 0.5, i < 2 ? Math.PI / 2 : -Math.PI / 2), function (k) { return k % 3 === 1; }); rings = rings.concat(i % 2 ? K.fade(r, 0.8, i) : K.armor(r, 2, [3, 9])); });
      K.g(rings, [5, 40]); K.b(rings, [22]);
      var mid = K.z(K.row(130, 660, 590, 660, 10), [1, 4, 5, 8]);
      return { pegs: K.tidy(K.join(rings, mid), { gates: G }), gatePairs: G };
    } },
  108: { name: 'Gespensterreigen', en: 'Ghost Dance', desc: 'Kleine Ringe tanzen im Kreis', descEn: 'Small rings dance in a circle', scene: ['pulsar', 280], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var dance = epiRings(360, 660, 220, 6, 42, 5, 0.18, 0.9, 0).map(function (q, i) { return Object.assign(q, { t: i % 5 === 0 ? 'z' : 'n' }); });
      var center = K.armor(K.z(K.ring(360, 660, 60, 8), [0, 2, 4, 6]), 2, [1, 5]); K.b(center, [3]);
      var frame = K.fade(K.z(K.join(K.row(100, 300, 620, 300, 11), K.row(100, 1030, 620, 1030, 11)), function (i) { return i % 3 === 0; }), 0.7, 0, 0.35); K.g(frame, [4, 17]);
      return { pegs: K.tidy(K.join(center, dance, frame)) };
    } },
  109: { name: 'Schattenwand', en: 'Shadow Wall', desc: 'Eine Mauer, deren Steine abwechselnd verschwinden', descEn: 'A wall whose stones vanish in turn', scene: ['blackhole', 270], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var wall = K.join(K.row(100, 600, 620, 600, 20), K.row(113, 626, 607, 626, 19)), w2 = wall.map(function (p, i) { return Object.assign(p, { fade: { w: 0.8, p: Math.floor(i % 20 / 4) * 1.3 } }); });
      var vault = K.z(K.grid(150, 740, 9, 4, 52, 72, true), function (i) { return i % 4 === 0; }); K.g(vault, [5]); K.b(vault, [14]);
      var sky = K.z(K.arc(360, 600, 300, Math.PI + 0.3, 2 * Math.PI - 0.3, 13), [0, 3, 6, 9, 12]); K.g(sky, [4]);
      return { pegs: K.tidy(K.join(w2, vault, sky), { tight: true }) };
    } },
  110: { name: 'Phantomflotte', en: 'Phantom Fleet', desc: 'Finale: flackernde Schiffe fliegen in Formation, ein Irrlicht zieht durch', descEn: 'Finale: flickering ships fly in formation as a wisp drifts through', scene: ['wrecks', 220], items: ['bomb', 'laser', 'chain', 'swarm', 'phantom', 'revive', 'extra'],
    build: function (K) {
      var ships = [];
      [[360, 380], [190, 620], [530, 620], [360, 860]].forEach(function (p, i) {
        var sh = K.z(K.ship(p[0], p[1], 105, 44), function (k) { return k % 3 === 0; }); K.armor(sh, 2, function (k) { return k % 6 === 4; });
        ships = ships.concat(i % 2 ? K.fade(sh, 0.6, i * 1.5, 0.2) : sh);
      });
      ships = K.lis(ships, 30, 20, 0.25, 0); K.g(ships, [3, 30]);
      var wisp = K.slide(K.b([{ x: 360, y: 250 }], [0]), 250, 0, 0.35, 1);
      var rails = [K.rail('arc', 360, 1080, { w: 380, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(ships, wisp), { rails: rails }), stoneRails: rails };
    } },

  /* ===== Welt 12 – Orbit-Werft: Schnecken, drehende Ringe, Werftanlagen ===== */
  111: { name: 'Andockring', en: 'Docking Ring', desc: 'Ein drehender Steinring, Spiralen docken an', descEn: 'A spinning stone ring with spirals docking', scene: ['ringstation', 200], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var rails = [K.rail('ring', 360, 700, { R: 150, gap: 0.5, z: 4, g: 1, spin: 0.3 })];
      var core = K.armor(K.z(K.ring(360, 700, 60, 8), [0, 2, 4, 6]), 2, [1, 5]); K.b(core, [3]);
      var arms = K.z(K.join(K.spiral(120, 330, 20, 60, 1.3, 46, 0), K.spiral(600, 330, 20, 60, 1.3, 46, Math.PI), K.spiral(120, 1060, 20, 60, 1.3, 46, Math.PI / 2), K.spiral(600, 1060, 20, 60, 1.3, 46, -Math.PI / 2)), function (i) { return i % 3 === 1; });
      K.g(arms, [5, 20]);
      return { pegs: K.tidy(K.join(core, arms), { rails: rails }), stoneRails: rails };
    } },
  112: { name: 'Die Schnecke', en: 'The Snail', desc: 'Eine große Steinschnecke, Bögen darüber', descEn: 'A large stone spiral with arcs above', scene: ['planet', 250], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var rails = [K.rail('spiral', 360, 760, { r0: 30, pitch: 42, turns: 2.1, z: 5, g: 1 })];
      var arcs = []; [200, 270, 340].forEach(function (R, i) { arcs = arcs.concat(K.z(K.arc(360, 760, R, -Math.PI / 2 - 1 + i * 0.1, -Math.PI / 2 + 1 - i * 0.1, Math.round(R * (2 - i * 0.2) / 46) + 1), function (k) { return k % 3 === i; })); });
      K.armor(arcs, 2, function (i) { return i % 7 === 3; }); K.g(arcs, [5, 20]); K.b(arcs, [12]);
      var feet = K.z(K.join(K.row(90, 1070, 180, 1110, 3), K.row(540, 1110, 630, 1070, 3)), [0, 2, 3, 5]);
      return { pegs: K.tidy(K.join(arcs, feet), { rails: rails }), stoneRails: rails };
    } },
  113: { name: 'Montageband', en: 'Assembly Line', desc: 'Rumpfplatten auf drei Förderbändern', descEn: 'Hull plates on three conveyor belts', scene: ['deep', 210], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var rails = [K.rail('bar', 300, 450, { w: 360, belt: 240, z: 2, g: 0 }), K.rail('bar', 420, 720, { w: 360, belt: -240, z: 2, g: 1 }), K.rail('bar', 300, 990, { w: 360, belt: 240, z: 2, g: 0 })];
      var plates = []; [[300, 360], [420, 630], [180, 870]].forEach(function (c, i) { plates = plates.concat(K.z(K.grid(c[0] - 110, c[1] - 30, i === 2 ? 3 : 5, 2, 55, 46, true), i === 2 ? [0, 3] : [0, 4, 7])); });
      K.armor(plates, 2, function (i) { return i % 9 === 2; }); K.g(plates, [3, 20]); K.b(plates, [12]);
      var robots = K.z(K.join(K.row(620, 330, 620, 520, 4), K.row(90, 600, 90, 790, 4), K.row(620, 870, 620, 1060, 4)), [0, 3, 4, 7, 8, 11]);
      return { pegs: K.tidy(K.join(plates, robots), { rails: rails }), stoneRails: rails };
    } },
  114: { name: 'Kranarme', en: 'Crane Arms', desc: 'Drei Kranarme schwingen über dem Rumpf', descEn: 'Three crane arms swing above the hull', scene: ['nebula', 30], items: ['bomb', 'laser', 'chain', 'phantom'],
    build: function (K) {
      var rails = [K.rail('arc', 180, 260, { w: 140, rot: Math.PI, hang: 260, z: 2, g: 0, swing: { a: 0.25, w: 0.75 } }), K.rail('arc', 360, 260, { w: 140, rot: Math.PI, hang: 220, z: 2, g: 1, swing: { a: 0.25, w: 0.75, p: 2 } }), K.rail('arc', 540, 260, { w: 140, rot: Math.PI, hang: 260, z: 2, g: 0, swing: { a: 0.25, w: 0.75, p: 4 } })];
      var hull = K.path([[90, 900], [200, 780], [520, 780], [630, 900], [520, 1020], [200, 1020]], 46, true);
      K.z(hull, function (i) { return i % 3 === 0; }); K.armor(hull, 2, function (i) { return i % 3 === 1; }); K.g(hull, [4]); K.b(hull, [10]);
      var keel = K.z(K.row(250, 900, 470, 900, 5), [0, 2, 4]);
      return { pegs: K.tidy(K.join(hull, keel), { rails: rails }), stoneRails: rails };
    } },
  115: { name: 'Raumdock', en: 'Space Dock', desc: 'Drei Dockröhren, darüber ein drehender Ring', descEn: 'Three dock tubes under a spinning ring', scene: ['binary', 180], items: ['bomb', 'laser', 'chain', 'swarm', 'frost'],
    build: function (K) {
      var rails = [K.rail('utube', 150, 900, { R: 50, h: 120, z: 2, g: 0 }), K.rail('utube', 360, 900, { R: 50, h: 120, z: 2, g: 1 }), K.rail('utube', 570, 900, { R: 50, h: 120, z: 2, g: 0 })];
      var ring = K.spin(K.z(K.ring(360, 450, 150, 20, 0.3), function (i) { return i % 3 === 0; }), 360, 450, 0.3); K.g(ring, [4]);
      var hub = K.armor(K.z(K.ring(360, 450, 50, 7), [0, 2, 4]), 2, [1, 5]); K.b(hub, [3]);
      var lights = K.z(K.row(90, 1120, 630, 1120, 12), [0, 3, 8, 11]);
      return { pegs: K.tidy(K.join(hub, ring, lights), { rails: rails }), stoneRails: rails };
    } },
  116: { name: 'Planetenring', en: 'Planetary Ring', desc: 'Ein Brockenring kreist, zwei Steinschnecken liegen darin', descEn: 'A ring of rocks orbits with two stone spirals inside', scene: ['gasgiant', 40], items: ['bomb', 'laser', 'chain', 'frost'],
    build: function (K) {
      var ring = K.squash(K.orbit(360, 660, 290, 38, 0.1, 0.3), 360, 660, 1, 1);
      ring = ring.map(function (p, i) { return Object.assign(p, { t: i % 3 === 0 ? 'z' : 'n' }); }); K.g(ring, [7, 25]);
      var rails = [K.rail('spiral', 250, 560, { r0: 20, pitch: 30, turns: 1.4, z: 3, g: 0 }), K.rail('spiral', 470, 780, { r0: 20, pitch: 30, turns: 1.4, ph: Math.PI, z: 3, g: 1 })];
      var moon = K.armor(K.z(K.ring(470, 470, 40, 5), [0, 2]), 2, [1, 3]); K.b(moon, [4]);
      var moon2 = K.z(K.ring(250, 860, 40, 5), [0, 2, 4]);
      return { pegs: K.tidy(K.join(ring, moon, moon2), { rails: rails }), stoneRails: rails };
    } },
  117: { name: 'Trockendock', en: 'Dry Dock', desc: 'Ein Schiff im Dock, Bänder liefern Teile', descEn: 'A ship in dock with belts delivering parts', scene: ['galaxy', 300], items: ['bomb', 'laser', 'chain', 'frost'],
    build: function (K) {
      var ship = K.z(K.ship(360, 620, 300, 46), function (i) { return i % 3 === 0; }); K.armor(ship, 2, function (i) { return i % 3 === 2; }); K.g(ship, [4]); K.b(ship, [10]);
      var core = K.z(K.row(360, 450, 360, 780, 7), [0, 3, 6]);
      var dock = K.z(K.join(K.row(70, 320, 70, 1000, 15), K.row(650, 320, 650, 1000, 15)), function (i) { return i % 5 === 2; }); K.armor(dock, 2, function (i) { return i % 5 === 4; });
      var rails = [K.rail('bar', 200, 1080, { w: 220, belt: 220, z: 2, g: 1 }), K.rail('bar', 520, 1080, { w: 220, belt: -220, z: 2, g: 0 })];
      return { pegs: K.tidy(K.join(ship, core, dock), { rails: rails }), stoneRails: rails };
    } },
  118: { name: 'Zentrifuge', en: 'Centrifuge', desc: 'Ein Steinring dreht schnell, innen kreist Erz', descEn: 'A stone ring spins fast with ore circling inside', scene: ['pulsar', 190], items: ['bomb', 'laser', 'chain', 'swarm', 'frost'],
    build: function (K) {
      var rails = [K.rail('ring', 360, 660, { R: 160, gap: 0.6, z: 4, g: 1, spin: 0.6 })];
      var inner = K.spin(K.z(K.ring(360, 660, 75, 10), [0, 2, 4, 6, 8]), 360, 660, -0.5);
      var hub = K.armor(K.b([{ x: 360, y: 660 }], [0]), 3);
      var outer = K.z(K.ring(360, 660, 285, 36, 0.3), function (i) { return i % 3 === 1; }); K.armor(outer, 2, function (i) { return i % 6 === 4; }); K.g(outer, [6, 24]);
      return { pegs: K.tidy(K.join(hub, inner, outer), { rails: rails }), stoneRails: rails };
    } },
  119: { name: 'Satellitenkette', en: 'Satellite Chain', desc: 'Kleine Satelliten kreisen auf einer Kette', descEn: 'Small satellites circle along a chain', scene: ['planet', 200], items: ['bomb', 'laser', 'chain', 'frost'],
    build: function (K) {
      var sats = []; [[180, 400], [540, 400], [180, 920], [540, 920], [360, 660]].forEach(function (c, i) { var r = K.z(K.orbit(c[0], c[1], 60, 7, i % 2 ? -0.6 : 0.6), [0, 2, 4]); sats = sats.concat(r); });
      K.g(sats, [2, 30]); K.b(sats, [18]);
      var chain = K.z(K.path([[180, 400], [540, 400], [360, 660], [180, 920], [540, 920]], 46).filter(function (p) { return [[180, 400], [540, 400], [180, 920], [540, 920], [360, 660]].every(function (c) { return Math.hypot(p.x - c[0], p.y - c[1]) > 105; }); }), function (i) { return i % 3 === 1; });
      K.armor(chain, 2, function (i) { return i % 3 === 2; });
      var rails = [K.rail('arc', 360, 280, { w: 300, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(sats, chain), { rails: rails }), stoneRails: rails };
    } },
  120: { name: 'Schiffswerft', en: 'Shipyard', desc: 'Finale: ein Schiff in Haltereifen, Schnecken als Kräne, Förderbänder', descEn: 'Finale: a ship in holding hoops, spirals as cranes, conveyor belts', scene: ['nebula', 200], items: ['bomb', 'laser', 'chain', 'swarm', 'frost', 'phantom', 'extra'],
    build: function (K) {
      var hull = K.path([[360, 330], [470, 470], [490, 820], [420, 950], [300, 950], [230, 820], [250, 470]], 46, true);
      K.z(hull, function (i) { return i % 3 === 0; }); K.armor(hull, 2, function (i) { return i % 3 === 1; }); K.g(hull, [5]); K.b(hull, [11]);
      var hoops = []; [520, 700, 880].forEach(function (y) { hoops = hoops.concat(K.squash(K.ring(360, y, 190, 22), 360, y, 1, 0.3).filter(function (p) { return Math.abs(p.x - 360) > 160; })); });
      K.z(hoops, function (i) { return i % 2 === 0; });
      var core = K.armor(K.z(K.row(360, 450, 360, 870, 9), [0, 2, 4, 6, 8]), 2, [1, 5]);
      var rails = [K.rail('spiral', 110, 330, { r0: 18, pitch: 26, turns: 1.3, z: 2, g: 0 }), K.rail('spiral', 610, 330, { r0: 18, pitch: 26, turns: 1.3, ph: Math.PI, z: 2, g: 1 }), K.rail('bar', 360, 1090, { w: 440, belt: 260, z: 3, g: 0 })];
      return { pegs: K.tidy(K.join(core, hull, hoops), { rails: rails }), stoneRails: rails };
    } },
  /* ===== Welt 13 – Sanshas Reich: dichte Panzer, schnelle Bahnen ===== */
  121: { name: 'Sansha-Vorposten', en: 'Sansha Outpost', desc: 'Ein gepanzertes Sechseck, Rampen an den Flanken', descEn: 'An armored hexagon with ramps on the flanks', scene: ['nebula', 130], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var hex = K.ring(360, 620, 200, 6, 0, 0), out = K.path(hex.concat([hex[0]]).map(function (p) { return [p.x, p.y]; }), 46);
      K.armor(out, 2, function (i) { return i % 2 === 0; }); K.z(out, function (i) { return i % 3 === 1; });
      var inner = K.z(K.grid(250, 540, 5, 4, 55, 55, true), function (i) { return i % 2 === 0; }); K.armor(inner, 2, function (i) { return i % 4 === 1; }); K.g(inner, [3]); K.b(inner, [7]);
      var top = K.z(K.row(130, 280, 590, 280, 10), [0, 3, 6, 9]);
      var low = K.z(K.row(130, 1040, 590, 1040, 10), [1, 4, 7]); K.g(low, [8]);
      return { pegs: K.tidy(K.join(out, inner, top, low)), ramps: [K.ramp(40, 560, 110, 660), K.ramp(680, 560, 610, 660)] };
    } },
  122: { name: 'Kontrollzentrum', en: 'Control Center', desc: 'Ein Panzergitter um einen schnell drehenden Steinring', descEn: 'An armored grid around a fast spinning stone ring', scene: ['pulsar', 120], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var rails = [K.rail('ring', 360, 660, { R: 110, gap: 0.6, z: 3, g: 1, spin: 0.9 })];
      var grid = K.grid(100, 310, 11, 10, 52, 78, true).filter(function (p) { return Math.hypot(p.x - 360, p.y - 660) > 165; });
      K.z(grid, function (i) { return i % 5 === 2; }); K.armor(grid, 2, function (i) { return i % 5 === 0; }); K.g(grid, [10, 60]); K.b(grid, [35]);
      var core = K.b(K.ring(360, 660, 45, 5), [0]);
      return { pegs: K.tidy(K.join(core, grid), { rails: rails }), stoneRails: rails };
    } },
  123: { name: 'Sklavenring', en: 'Thrall Ring', desc: 'Drei schnelle Ringe kreisen um einen Panzerkern', descEn: 'Three fast rings circle an armored core', scene: ['galaxy', 110], items: ['bomb', 'laser', 'chain', 'swarm'],
    build: function (K) {
      var r1 = K.z(K.orbit(360, 660, 120, 15, 0.6, 0.3), function (i) { return i % 3 === 0; }), r2 = K.z(K.orbit(360, 660, 200, 25, -0.45, 0.25), function (i) { return i % 4 === 1; }), r3 = K.z(K.orbit(360, 660, 285, 36, 0.3, 0.2), function (i) { return i % 5 === 2; });
      K.armor(r2, 2, function (i) { return i % 4 === 3; }); K.armor(r3, 2, function (i) { return i % 3 === 0; }); K.g(r1, [4]); K.g(r3, [20]); K.b(r2, [12]);
      var core = K.armor(K.z(K.ring(360, 660, 45, 5), [0, 2, 4]), 3, [1, 3]);
      return { pegs: K.tidy(K.join(core, r1, r2, r3)) };
    } },
  124: { name: 'Truppentransporter', en: 'Troop Carriers', desc: 'Drei gepanzerte Transporter fliegen Schleifen', descEn: 'Three armored carriers fly loops', scene: ['deep', 120], items: ['bomb', 'laser', 'chain'],
    build: function (K) {
      var sh = []; [[360, 380, 0], [200, 700, 2], [520, 700, 4]].forEach(function (c) { var s = K.z(K.ship(c[0], c[1], 110, 44), function (i) { return i % 3 === 0; }); K.armor(s, 2, function (i) { return i % 3 !== 0; }); sh = sh.concat(K.lis(s, 50, 30, 0.35, c[2])); });
      K.g(sh, [4, 30]); K.b(sh, [18]);
      var flak = K.z(K.row(90, 1060, 630, 1060, 12), [0, 3, 6, 9, 11]); K.armor(flak, 2, [1, 5, 10]);
      var rails = [K.rail('bar', 360, 950, { w: 300, belt: 380, z: 2, g: 1 })];
      return { pegs: K.tidy(K.join(sh, flak), { rails: rails }), stoneRails: rails };
    } },
  125: { name: 'Netzwerk', en: 'Network', desc: 'Knoten, verbunden durch gepanzerte Leitungen', descEn: 'Nodes linked by armored lines', scene: ['nebula', 100], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var N = [[180, 360], [540, 360], [360, 660], [180, 960], [540, 960]], nodes = [], lines = [];
      N.forEach(function (c) { nodes = nodes.concat(K.z(K.ring(c[0], c[1], 48, 6), [0, 3])); });
      [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4]].forEach(function (e) { var a = N[e[0]], b = N[e[1]], l = K.row(a[0], a[1], b[0], b[1], Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 46) + 1).filter(function (p) { return N.every(function (c) { return Math.hypot(p.x - c[0], p.y - c[1]) > 90; }); }); lines = lines.concat(K.armor(l, 2, function (i) { return i % 4 === 0; })); });
      K.z(lines, function (i) { return i % 5 === 3; }); K.g(nodes, [1, 13]); K.b(nodes, [22]);
      var rails = [K.rail('bar', 360, 1110, { w: 300, belt: -400, z: 2, g: 0 })];
      return { pegs: K.tidy(K.join(nodes, lines), { rails: rails }), stoneRails: rails };
    } },
  126: { name: 'Implantat-Labor', en: 'Implant Lab', desc: 'Ein Stern aus Rauten, ein schnelles Pendel', descEn: 'A star of rhombi and a fast pendulum', scene: ['pillars', 120], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var dia = []; for (var k = 0; k < 6; k++) { var a = -Math.PI / 2 + k * Math.PI / 3, d = K.rot(K.diamond(360 + Math.cos(a) * 210, 700 + Math.sin(a) * 210, 80, 140, 44), 360 + Math.cos(a) * 210, 700 + Math.sin(a) * 210, a + Math.PI / 2); K.z(d, [0, 3]); K.armor(d, 2, [1]); dia = dia.concat(d); }
      K.g(dia, [5, 17]); K.b(dia, [11]);
      var core = K.armor(K.z(K.ring(360, 700, 50, 7), [0, 3]), 2, [1, 5]);
      var rails = [K.rail('arc', 360, 250, { w: 160, rot: Math.PI, hang: 110, z: 2, g: 1, swing: { a: 0.5, w: 1.3 } })];
      return { pegs: K.tidy(K.join(core, dia), { rails: rails }), stoneRails: rails };
    } },
  127: { name: 'Wachtürme', en: 'Watchtowers', desc: 'Drei Türme, oben drehen sich Balken', descEn: 'Three towers with beams spinning on top', scene: ['nebula', 120], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var towers = []; [150, 360, 570].forEach(function (x, i) { var c = K.row(x, 600 - i % 2 * 80, x, 1080, Math.round((480 + i % 2 * 80) / 46) + 1); K.armor(c, 2, function (k) { return k % 4 === 0; }); K.z(c, function (k) { return k % 3 === 1; }); towers = towers.concat(c); });
      K.g(towers, [4, 30]); K.b(towers, [16]);
      var rails = [K.rail('bar', 150, 450, { w: 150, z: 2, g: 0, spin: 0.8 }), K.rail('bar', 360, 370, { w: 150, z: 2, g: 1, spin: -0.8 }), K.rail('bar', 570, 450, { w: 150, z: 2, g: 0, spin: 0.8 })];
      var gaps = K.z(K.join(K.row(255, 700, 255, 960, 6), K.row(465, 700, 465, 960, 6)), [0, 3, 5, 6, 9, 11]);
      return { pegs: K.tidy(K.join(towers, gaps), { rails: rails }), stoneRails: rails };
    } },
  128: { name: 'Kristallklingen', en: 'Crystal Blades', desc: 'Vier Klingen drehen sich um ein Band', descEn: 'Four blades rotate around a belt', scene: ['deep', 120], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var blades = []; for (var k = 0; k < 4; k++) { var a = k * Math.PI / 2 + 0.4; blades = blades.concat(K.z(K.row(360 + Math.cos(a) * 90, 620 + Math.sin(a) * 90, 360 + Math.cos(a) * 280, 620 + Math.sin(a) * 280, 5), [2, 4])); }
      blades = K.spin(blades, 360, 620, 0.35); K.armor(blades, 2, function (i) { return i % 5 === 1; }); K.g(blades, [3, 13]);
      var hub = K.armor(K.b(K.ring(360, 620, 40, 5), [0]), 2, [1, 3]);
      var rails = [K.rail('bar', 360, 1060, { w: 440, belt: 380, z: 3, g: 1 })];
      var top = K.z(K.row(120, 270, 600, 270, 10), [1, 4, 8]);
      return { pegs: K.tidy(K.join(hub, blades, top), { rails: rails }), stoneRails: rails };
    } },
  129: { name: 'Gedankenkontrolle', en: 'Mind Control', desc: 'Atmende Ringe, dazwischen Geisterbrocken', descEn: 'Breathing rings with ghost rocks between them', scene: ['blackhole', 110], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var r1 = K.z(K.pulse(360, 660, 100, 12, 0.3, 22, 1.3), [0, 2, 4, 6, 8, 10]), r2 = K.z(K.pulse(360, 660, 210, 26, -0.2, 22, 1.3), function (i) { return i % 3 === 2; });
      K.armor(r1, 2, [2, 6, 10]); K.armor(r2, 2, function (i) { return i % 4 === 0; }); K.g(r2, [5, 17]);
      var ghosts = K.fade(K.ring(360, 660, 300, 38, 0.3), 1.0, 0, 0.3); K.b(ghosts, [10]);
      var eye = K.armor([{ x: 360, y: 660 }], 3);
      return { pegs: K.tidy(K.join(eye, r1, r2, ghosts)) };
    } },
  130: { name: 'Sansha-Festung', en: 'Sansha Fortress', desc: 'Finale: eine Panzerfestung, ein schnell kreisender Steinring, wandernde Tore', descEn: 'Finale: an armored fortress, a fast spinning stone ring, roaming gates', scene: ['pulsar', 110], items: ['bomb', 'laser', 'chain', 'drill', 'overload', 'swarm', 'extra'],
    build: function (K) {
      var walls = K.path([[150, 420], [570, 420], [570, 920], [150, 920]], 27, true).filter(function (p) { return !(Math.abs(p.x - 360) < 40 && p.y < 430) && !(Math.abs(p.x - 360) < 40 && p.y > 910); });
      K.armor(walls, 2, function (i) { return i % 2 === 0; }); K.armor(walls, 3, function (i) { return i % 12 === 0; }); K.z(walls, function (i) { return i % 7 === 3; });
      var rails = [K.rail('ring', 360, 670, { R: 140, gap: 0.55, z: 4, g: 1, spin: 0.75 })];
      var core = K.armor(K.z(K.ring(360, 670, 55, 7), [0, 4]), 2, [2]);
      var keep = K.b([{ x: 360, y: 670 }], [0]);
      var G = [K.gates(80, 300, 360, 340, { type: 'slide', x0: 80, x1: 80, y0: 300, y1: 1000, w: 0.25, a0: 0 }), K.gates(640, 1000, 360, 1000, { type: 'slide', x0: 640, x1: 640, y0: 300, y1: 1000, w: 0.25, a0: Math.PI })];
      var top = K.z(K.row(200, 280, 520, 280, 8), [0, 2, 5, 7]); K.g(top, [3]);
      return { pegs: K.tidy(K.join(keep, core, walls, top), { rails: rails, gates: G, tight: true }), stoneRails: rails, gatePairs: G };
    } },

  /* ===== Welt 14 – Kernbruch: fast alles bewegt sich ===== */
  131: { name: 'Plasmafluss', en: 'Plasma Stream', desc: 'Wellen fließen, Bänder treiben', descEn: 'Waves flow, belts drive', scene: ['sun', 150], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var w = []; [320, 520, 720].forEach(function (y, i) { w = w.concat(K.slide(K.z(K.wave(130, 590, y, 30, 1.5, 11, i), function (k) { return k % 3 === i % 3; }), 40, 0, 0.5 + i * 0.1, i * 2)); });
      K.armor(w, 2, function (i) { return i % 7 === 4; }); K.g(w, [4, 25]); K.b(w, [15]);
      var rails = [K.rail('bar', 230, 920, { w: 240, belt: 300, z: 2, g: 1 }), K.rail('bar', 490, 1060, { w: 240, belt: -300, z: 2, g: 0 })];
      return { pegs: K.tidy(w, { rails: rails }), stoneRails: rails };
    } },
  132: { name: 'Brennstäbe', en: 'Fuel Rods', desc: 'Stäbe heben und senken sich, eine Wippe in der Mitte', descEn: 'Rods rise and sink with a seesaw in the middle', scene: ['pulsar', 150], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var rods = []; [100, 190, 280, 440, 530, 620].forEach(function (x, i) { rods = rods.concat(K.slide(K.z(K.row(x, 380, x, 660, 7), [1, 5]), 0, 60, 0.6, i)); });
      K.armor(rods, 2, function (i) { return i % 7 === 3; }); K.g(rods, [4, 30]); K.b(rods, [18]);
      var rails = [K.rail('bar', 360, 880, { w: 300, z: 2, g: 1, swing: { a: 0.4, w: 0.9 } })];
      var pool = K.z(K.row(140, 1080, 580, 1080, 10), [0, 3, 6, 9]);
      return { pegs: K.tidy(K.join(rods, pool), { rails: rails }), stoneRails: rails };
    } },
  133: { name: 'Kettenreaktion', en: 'Chain Reaction', desc: 'Kleine Kreisel tanzen in einer Kette', descEn: 'Small spinners dance in a chain', scene: ['nebula', 160], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var spinners = []; [[150, 330], [360, 460], [570, 590], [360, 720], [150, 850], [360, 980], [570, 1100]].forEach(function (c, i) { spinners = spinners.concat(K.z(K.orbit(c[0], c[1], 50, 6, i % 2 ? -0.8 : 0.8), [0, 3])); });
      K.g(spinners, [2, 26]); K.b(spinners, [14]);
      var hubs = K.armor(K.z([[150, 330], [360, 460], [570, 590], [360, 720], [150, 850], [360, 980], [570, 1100]].map(function (c) { return { x: c[0], y: c[1] }; }), [0, 3, 6]), 2, [1, 4]);
      var rails = [K.rail('arc', 560, 330, { w: 150, rot: Math.PI, hang: 80, z: 2, g: 0, swing: { a: 0.4, w: 1 } })];
      return { pegs: K.tidy(K.join(hubs, spinners), { rails: rails }), stoneRails: rails };
    } },
  134: { name: 'Kühlmittel', en: 'Coolant', desc: 'Kühlkanäle blinken, Bänder pumpen', descEn: 'Coolant channels flicker, belts pump', scene: ['ice', 160], items: ['bomb', 'laser', 'chain', 'overload'],
    build: function (K) {
      var ch = []; [[110, 320], [610, 320]].forEach(function (c, i) { ch = ch.concat(K.fade(K.row(c[0], c[1], c[0], 1060, 17), 0.9, i * 2, 0.2)); });
      K.z(ch, function (i) { return i % 4 === 1; });
      var rails = [K.rail('bar', 360, 480, { w: 300, belt: 350, z: 2, g: 1 }), K.rail('bar', 360, 760, { w: 240, belt: -350, z: 2, g: 0 })];
      var cells = K.z(K.join(K.grid(250, 580, 5, 2, 55, 50, true), K.grid(250, 860, 5, 3, 55, 50, true)), function (i, p) { return i % 3 === 0 && p.y > 880; }); K.armor(cells, 2, function (i) { return i % 4 === 1; }); K.g(cells, [3]); K.b(cells, [11]);
      return { pegs: K.tidy(K.join(ch, cells), { rails: rails }), stoneRails: rails };
    } },
  135: { name: 'Ruhige Mitte', en: 'Calm Center', desc: 'Durchatmen: eine stille Rose aus Brocken', descEn: 'Take a breath: a still rose of rocks', scene: ['deep', 160], items: ['bomb', 'laser', 'chain', 'jump'],
    build: function (K) {
      var r = K.z(rose(360, 660, 290, 4, 46), function (i) { return i % 3 === 0; }); K.armor(r, 2, function (i) { return i % 6 === 2; }); K.g(r, [4, 22]); K.b(r, [13]);
      var c = K.z(K.ring(360, 660, 50, 7), [0, 3]);
      var frame = K.z(K.join(K.row(100, 280, 620, 280, 11), K.row(100, 1060, 620, 1060, 11)), [0, 5, 10, 11, 16, 21]);
      return { pegs: K.tidy(K.join(c, r, frame)) };
    } },
  136: { name: 'Überhitzung', en: 'Overheat', desc: 'Atmende Ringe, zwei drehende Steinbögen', descEn: 'Breathing rings and two spinning stone arcs', scene: ['sun', 170], items: ['bomb', 'laser', 'chain', 'jump'],
    build: function (K) {
      var p1 = K.z(K.pulse(200, 450, 90, 11, 0.4, 18, 1.2), [0, 4, 8]), p2 = K.z(K.pulse(520, 870, 90, 11, -0.4, 18, 1.2, 0), [1, 5, 9]);
      K.armor(p1, 2, [2, 6]); K.armor(p2, 2, [3, 7]); K.g(p1, [10]); K.b(p2, [0]);
      var rails = [K.rail('arc', 520, 450, { w: 200, z: 2, g: 1, spin: 0.5 }), K.rail('arc', 200, 870, { w: 200, z: 2, g: 0, spin: -0.5 })];
      var cores = K.armor(K.z([{ x: 200, y: 450 }, { x: 520, y: 870 }], [0, 1]), 2);
      var diag = K.z(K.row(120, 1100, 600, 250, 12).filter(function (p) { return Math.hypot(p.x - 360, p.y - 660) < 120; }), [0, 2]);
      var frame = K.z(K.join(K.row(400, 280, 640, 280, 6), K.row(80, 1080, 320, 1080, 6), K.row(80, 300, 80, 560, 6), K.row(640, 760, 640, 1020, 6)), function (i) { return i % 3 === 1; });
      return { pegs: K.tidy(K.join(cores, p1, p2, diag, frame), { rails: rails }), stoneRails: rails };
    } },
  137: { name: 'Reaktorschild', en: 'Reactor Shield', desc: 'Schildbögen drehen sich um den Kern', descEn: 'Shield arcs rotate around the core', scene: ['pulsar', 170], items: ['bomb', 'laser', 'chain', 'jump'],
    build: function (K) {
      var sh1 = [], sh2 = []; for (var k = 0; k < 3; k++) { sh1 = sh1.concat(K.arc(360, 660, 130, k * 2.094, k * 2.094 + 1.2, 5)); sh2 = sh2.concat(K.arc(360, 660, 230, k * 2.094 + 1, k * 2.094 + 2.2, 7)); }
      sh1 = K.spin(K.armor(sh1, 2, function (i) { return i % 2 === 0; }), 360, 660, 0.4); sh2 = K.spin(K.armor(sh2, 2, function (i) { return i % 3 === 0; }), 360, 660, -0.3);
      K.z(sh1, function (i) { return i % 2 === 1; }); K.z(sh2, function (i) { return i % 3 === 1; }); K.g(sh2, [5]);
      var core = K.z(K.ring(360, 660, 50, 7), [0, 2, 4, 6]); K.b(core, [3]);
      var rails = [K.rail('ring', 360, 660, { R: 320, gap: 0.6, z: 3, g: 1 })];
      return { pegs: K.tidy(K.join(core, sh1, sh2), { rails: rails }), stoneRails: rails };
    } },
  138: { name: 'Strahlungsgürtel', en: 'Radiation Belt', desc: 'Zwei Gürtel kreisen gegeneinander', descEn: 'Two belts circle against each other', scene: ['gasgiant', 170], items: ['bomb', 'laser', 'chain', 'jump'],
    build: function (K) {
      var b1 = K.z(K.squash(K.orbit(360, 660, 280, 34, 0.25, 0.3), 360, 660, 1, 1), function (i) { return i % 4 === 1; }), b2 = K.z(K.orbit(360, 660, 180, 22, -0.35, 0.35), function (i) { return i % 3 === 1; });
      K.armor(b1, 2, function (i) { return i % 4 === 3; }); K.g(b1, [5]); K.g(b2, [9]); K.b(b2, [15]);
      var rails = [K.rail('spiral', 360, 660, { r0: 20, pitch: 28, turns: 1.5, z: 3, g: 0 })];
      return { pegs: K.tidy(K.join(b1, b2), { rails: rails }), stoneRails: rails };
    } },
  139: { name: 'Notabschaltung', en: 'Emergency Shutdown', desc: 'Pendel und gleitende Riegel', descEn: 'Pendulums and sliding bolts', scene: ['nebula', 170], items: ['bomb', 'laser', 'chain', 'jump'],
    build: function (K) {
      var rails = [K.rail('arc', 220, 250, { w: 150, rot: Math.PI, hang: 220, z: 2, g: 1, swing: { a: 0.35, w: 0.9 } }), K.rail('arc', 500, 250, { w: 150, rot: Math.PI, hang: 220, z: 2, g: 0, swing: { a: 0.35, w: 0.9, p: Math.PI } })];
      var bolts = []; [700, 850, 1000].forEach(function (y, i) { bolts = bolts.concat(K.slide(K.z(K.row(160, y, 400, y, 6), [0, 3, 5]), 80, 0, 0.5, i * 2)); });
      K.armor(bolts, 2, function (i) { return i % 6 === 1; }); K.g(bolts, [4]); K.b(bolts, [10]);
      var mid = K.armor(K.z(K.row(360, 300, 360, 560, 6), [1, 3, 5]), 2, [0, 2]);
      var sides = K.z(K.join(K.row(620, 600, 620, 1080, 10), K.row(80, 560, 80, 760, 5)), function (i) { return i % 3 === 0; });
      return { pegs: K.tidy(K.join(mid, bolts, sides), { rails: rails }), stoneRails: rails };
    } },
  140: { name: 'Reaktorkern', en: 'Reactor Core', desc: 'Finale: der Kern glüht in drei Ringen, Pendel und Bänder halten ihn', descEn: 'Finale: the core glows inside three rings, held by pendulums and belts', scene: ['sun', 170], items: ['bomb', 'laser', 'chain', 'swarm', 'overload', 'jump', 'extra'],
    build: function (K) {
      var r1 = K.spin(K.z(K.ring(360, 640, 90, 12), [0, 3, 6, 9]), 360, 640, 0.5), r2 = K.spin(K.z(K.ring(360, 640, 170, 22, 0.35), function (i) { return i % 3 === 1; }), 360, 640, -0.35);
      K.armor(r2, 2, function (i) { return i % 3 === 0; }); K.g(r1, [5]); K.g(r2, [11]);
      var core = K.armor(K.b(K.ring(360, 640, 35, 4), [0]), 3, [1, 2, 3]);
      var rails = [K.rail('ring', 360, 640, { R: 260, gap: 0.6, z: 4, g: 1 }), K.rail('bar', 230, 1080, { w: 220, belt: 320, z: 2, g: 0 }), K.rail('bar', 490, 1080, { w: 220, belt: -320, z: 2, g: 0 })];
      var top = K.z(K.row(160, 280, 560, 280, 9), [0, 2, 4, 6, 8]);
      return { pegs: K.tidy(K.join(core, r1, r2, top), { rails: rails }), stoneRails: rails };
    } },

  /* ===== Welt 15 – Omni-Reich: alles zusammen ===== */
  141: { name: 'Das Zeichen', en: 'The Sign', desc: 'Das E im Ring aus Brocken', descEn: 'The E in the ring, made of rocks', scene: ['nebula', 30], items: ['bomb', 'laser', 'chain', 'jump'],
    build: function (K) {
      var ring = K.ring(360, 660, 270, 36).filter(function (p) { var a = Math.atan2(p.y - 660, p.x - 360); return !(a > -0.55 && a < 0.2); });
      K.z(ring, function (i) { return i % 3 === 0; }); K.armor(ring, 2, function (i) { return i % 6 === 2; });
      var E = K.join(K.row(250, 500, 470, 500, 6), K.row(250, 660, 430, 660, 5), K.row(250, 820, 470, 820, 6), K.row(250, 546, 250, 774, 6));
      K.z(E, [0, 5, 6, 10, 11, 16]); K.armor(E, 2, [2, 13, 19]); K.g(E, [8]); K.g(ring, [14]); K.b(E, [3]);
      var spark = K.z(K.row(80, 260, 220, 380, 4), [0, 3]);
      return { pegs: K.tidy(K.join(E, ring, spark)) };
    } },
  142: { name: 'Alles im Fluss', en: 'Everything Flows', desc: 'Wellen, Bänder und eine Wippe in einem Strom', descEn: 'Waves, belts and a seesaw in one stream', scene: ['galaxy', 30], items: ['bomb', 'laser', 'chain', 'swarm', 'jump'],
    build: function (K) {
      var w1 = K.slide(K.z(K.wave(110, 610, 300, 30, 2, 12), [1, 5, 9]), 40, 0, 0.6), w2 = K.slide(K.z(K.wave(110, 610, 700, 30, 2, 12, 1), [2, 6, 10]), 40, 0, 0.6, Math.PI);
      K.armor(w1, 2, [3, 7]); K.armor(w2, 2, [4, 8]); K.g(w1, [11]); K.b(w2, [0]);
      var rails = [K.rail('bar', 240, 500, { w: 240, belt: 320, z: 2, g: 1 }), K.rail('bar', 360, 900, { w: 280, z: 2, g: 0, swing: { a: 0.4, w: 0.8 } }), K.rail('bar', 480, 1080, { w: 240, belt: -320, z: 2, g: 0 })];
      var side = K.z(K.join(K.row(620, 420, 620, 620, 5), K.row(100, 820, 100, 1000, 4), K.row(560, 820, 640, 900, 3)), [0, 2, 4, 6, 8, 10]);
      return { pegs: K.tidy(K.join(w1, w2, side), { rails: rails }), stoneRails: rails };
    } },
  143: { name: 'Spiegelwelten', en: 'Mirror Worlds', desc: 'Zwei Hälften bewegen sich spiegelbildlich', descEn: 'Two halves move as mirror images', scene: ['binary', 40], items: ['bomb', 'laser', 'chain', 'swarm', 'jump'],
    build: function (K) {
      var half = K.join(K.arc(200, 450, 100, -2.5, 0.6, 7), K.row(90, 700, 270, 860, 5), K.ring(190, 1010, 55, 7));
      K.z(half, function (i) { return i % 3 === 0; }); K.armor(half, 2, function (i) { return i % 4 === 2; });
      var L = K.lis(half, 30, 20, 0.4, 0), R = K.lis(K.mirror(half), 30, 20, 0.4, Math.PI);
      K.g(L, [4]); K.g(R, [12]); K.b(R, [6]);
      var rails = [K.rail('ring', 360, 660, { R: 70, gap: 0.6, z: 2, g: 1, spin: 0.6 })];
      return { pegs: K.tidy(K.join(L, R), { rails: rails }), stoneRails: rails };
    } },
  144: { name: 'Felswand', en: 'Rock Face', desc: 'Eine dichte Panzerwand, dahinter das Erz', descEn: 'A dense armored wall with ore behind it', scene: ['moon', 40], items: ['bomb', 'laser', 'chain', 'drill'],
    build: function (K) {
      var wall = K.join(K.row(100, 560, 620, 560, 20), K.row(113, 586, 607, 586, 19), K.row(100, 612, 620, 612, 20));
      K.armor(wall, 2); K.armor(wall, 3, function (i) { return i % 5 === 0; }); var w2 = wall.filter(function (p, i) { return i % 19 !== 9; });
      var vault = K.z(K.grid(150, 740, 9, 5, 52, 72, true), function (i) { return i % 3 === 0; }); K.g(vault, [4, 20]); K.b(vault, [14]);
      var sky = K.z(K.arc(360, 560, 300, Math.PI + 0.3, 2 * Math.PI - 0.3, 13), [0, 3, 6, 9, 12]);
      return { pegs: K.tidy(K.join(w2, vault, sky), { tight: true }) };
    } },
  145: { name: 'Ruhe vor dem Sturm', en: 'Calm Before the Storm', desc: 'Durchatmen: Bögen, Reihen, ein stilles Herz', descEn: 'Take a breath: arcs, rows and a still heart', scene: ['deep', 40], items: ['bomb', 'laser', 'chain', 'rockfall'],
    build: function (K) {
      var h = K.z(K.heart(360, 640, 12, 46), function (i) { return i % 3 === 0; }); K.armor(h, 2, function (i) { return i % 6 === 2; }); K.g(h, [4]); K.b(h, [10]);
      var arcs = K.z(K.join(K.arc(360, 640, 330, -2.7, -0.45, 12), K.arc(360, 640, 330, 0.9, 2.25, 6)), function (i) { return i % 3 === 1; });
      var rows = K.z(K.join(K.row(90, 1080, 270, 1080, 4), K.row(450, 1080, 630, 1080, 4)), [0, 3, 4, 7]);
      return { pegs: K.tidy(K.join(h, arcs, rows)) };
    } },
  146: { name: 'Kaleidoskop', en: 'Kaleidoscope', desc: 'Eine Rose dreht sich in zwei Steinringen', descEn: 'A rose turns inside two stone rings', scene: ['galaxy', 50], items: ['bomb', 'laser', 'chain', 'swarm', 'rockfall'],
    build: function (K) {
      var r = K.spin(K.z(rose(360, 660, 200, 5, 44), function (i) { return i % 3 === 0; }), 360, 660, 0.2); K.armor(r, 2, function (i) { return i % 6 === 4; }); K.g(r, [5, 20]);
      var rails = [K.rail('ring', 360, 660, { R: 260, gap: 0.5, z: 3, g: 1, spin: -0.25 })];
      var corners = K.z(K.join(K.ring(100, 270, 42, 5), K.ring(620, 270, 42, 5), K.ring(100, 1080, 42, 5), K.ring(620, 1080, 42, 5)), [0, 5, 10, 15]); K.b(corners, [2]);
      return { pegs: K.tidy(K.join(r, corners), { rails: rails }), stoneRails: rails };
    } },
  147: { name: 'Sternennetz', en: 'Star Net', desc: 'Ein Stern aus Toren und Linien', descEn: 'A star of gates and lines', scene: ['nebula', 50], items: ['bomb', 'laser', 'chain', 'swarm', 'rockfall'],
    build: function (K) {
      var star = K.z(K.star(360, 660, 300, 140, 5, 46), function (i) { return i % 3 === 1; }); K.armor(star, 2, function (i) { return i % 3 === 2; }); K.g(star, [4, 20]); K.b(star, [12]);
      var tips = starPts(360, 660, 300, 140, 5, -Math.PI / 2).filter(function (p, i) { return i % 2 === 0; });
      var G = [K.gates(tips[0].x, tips[0].y - 60, tips[2].x + 20, tips[2].y + 60), K.gates(tips[1].x + 50, tips[1].y, tips[4].x - 50, tips[4].y)];
      var core = K.spin(K.z(K.ring(360, 660, 60, 8), [0, 2, 4, 6]), 360, 660, 0.5);
      return { pegs: K.tidy(K.join(core, star), { gates: G }), gatePairs: G };
    } },
  148: { name: 'Zeitschleife', en: 'Time Loop', desc: 'Gruppen fliegen Achten, ein Pendel zählt die Zeit', descEn: 'Groups fly figure eights, a pendulum keeps time', scene: ['wormhole', 50], items: ['bomb', 'laser', 'chain', 'swarm', 'rockfall'],
    build: function (K) {
      var g = []; [[200, 460], [520, 460], [200, 880], [520, 880]].forEach(function (c, i) { var q = K.z(K.grid(c[0] - 46, c[1] - 40, 3, 3, 46, 40, false), [0, 4, 8]); K.armor(q, 2, [2, 6]); g = g.concat(K.lis(q, 45, 30, 0.45, i * 1.57)); });
      K.g(g, [3, 30]); K.b(g, [19]);
      var rails = [K.rail('arc', 360, 300, { w: 170, rot: Math.PI, hang: 330, z: 3, g: 1, swing: { a: 0.3, w: 0.7 } })];
      return { pegs: K.tidy(g, { rails: rails }), stoneRails: rails };
    } },
  149: { name: 'Der Vorhof', en: 'The Forecourt', desc: 'Lange Gleitbahnen führen zum Tor', descEn: 'Long glide rails lead to the gate', scene: ['wormhole', 30], items: ['bomb', 'laser', 'chain', 'swarm', 'rockfall', 'extra'],
    build: function (K) {
      var rails = [K.rail('wave', 360, 480, { w: 540, amp: 40, waves: 2, ph: 0, z: 4, g: 1 }), K.rail('spiral', 170, 820, { r0: 20, pitch: 30, turns: 1.4, z: 2, g: 0 }), K.rail('spiral', 550, 820, { r0: 20, pitch: 30, turns: 1.4, ph: Math.PI, z: 2, g: 1 })];
      var pillars = K.z(K.join(K.row(360, 620, 360, 1080, 10), K.row(80, 300, 80, 1000, 15), K.row(640, 300, 640, 1000, 15)), function (i) { return i % 4 === 1; }); K.armor(pillars, 2, function (i) { return i % 4 === 3; }); K.g(pillars, [6, 30]); K.b(pillars, [20]);
      var crown = K.z(K.arc(360, 480, 300, -Math.PI / 2 - 0.8, -Math.PI / 2 + 0.8, 12), [0, 4, 7, 11]);
      return { pegs: K.tidy(K.join(pillars, crown), { rails: rails }), stoneRails: rails };
    } },
  150: { name: 'Das Omni-Tor', en: 'The Omni Gate', desc: 'Finale: drei gegenläufige Torringe, eine lange Gleitbahn, Torpaare, ein Schwerkraftfeld und der gepanzerte Kern mit dem Omni-Zeichen', descEn: 'Finale: three counter-rotating gate rings, a long glide rail, gate pairs, a gravity field and the armored core bearing the Omni sign', scene: ['deep', 30], items: ['bomb', 'laser', 'chain', 'swarm', 'volley', 'drill', 'overload', 'jump', 'rockfall', 'extra'],
    build: function (K) {
      var c = [360, 700];
      var r1 = K.spin(K.z(K.ring(c[0], c[1], 150, 20, 0.35), function (i) { return i % 3 === 0; }), c[0], c[1], 0.3);
      var r2 = K.spin(K.z(K.ring(c[0], c[1], 220, 30, 0.3), function (i) { return i % 4 === 1; }), c[0], c[1], -0.22);
      K.armor(r1, 2, function (i) { return i % 3 === 1; }); K.armor(r2, 2, function (i) { return i % 4 === 3; }); K.g(r1, [5]); K.g(r2, [9, 22]);
      var E = K.join(K.row(c[0] - 60, c[1] - 90, c[0] + 60, c[1] - 90, 4), K.row(c[0] - 60, c[1], c[0] + 20, c[1], 3), K.row(c[0] - 60, c[1] + 90, c[0] + 60, c[1] + 90, 4), K.row(c[0] - 60, c[1] - 45, c[0] - 60, c[1] + 45, 3).filter(function (p, i) { return i !== 1; }));   // das E im Ring: Endgegner
      K.armor(E, 3); K.z(E, [0, 3, 6, 7, 10, 11, 12]); K.armor(E, 2, [1, 2, 8, 9]);
      var rails = [K.rail('ring', c[0], c[1], { R: 300, gap: 0.55, z: 5, g: 1 }), K.rail('wave', 360, 300, { w: 540, amp: 34, waves: 2.5, ph: Math.PI / 2, z: 4, g: 1 })];
      var G = [K.gates(60, 1150, 670, 200), K.gates(660, 1150, 50, 200)];
      var base = K.z(K.row(180, 1110, 540, 1110, 8), [0, 2, 5, 7]); K.b(base, [3]);
      return { pegs: K.tidy(K.join(E, r1, r2, base), { rails: rails, gates: G }), stoneRails: rails, gatePairs: G, wells: [K.well(c[0], c[1], 70, 300)] };
    } }
};
var OB_LEVELS = 150;
/* Drohnen je Level (Phase 7, nach Bot-Bericht): 12, Finale 13; Welten, die aus der Kurve fallen, ±1; späte Finale (130–150) +1 */
var OB_BALLS_WORLD = { 7: -1, 8: 1, 10: -1, 14: 1 };
function obBalls(L) { var w = Math.ceil(L / 10), fin = L % 10 === 0; return 12 + (fin ? 1 : 0) + (OB_BALLS_WORLD[w] || 0) + (fin && w >= 13 ? 1 : 0); }
function obHandDef(L, d) {
  var fresh = Object.keys(POWER_UNLOCK).filter(function (k) { return POWER_UNLOCK[k] === L; }), items = L === OB_LEVELS ? OB_POWERS.concat(obNewAt(L)) : fresh.concat(d.items || obPowersFor(L, mulberry32(L * 7907), 2));   // Finale 150: alle Items   // neues Item zuerst (erster grüner Brocken)
  var desc = d.desc + (fresh.length ? ' · neu: ' + fresh.map(function (k) { return POWER_NAMES[k]; }).join(', ') : '');
  if (d.en) OB_WORD_EN[d.name] = d.en; if (d.descEn) OB_WORD_EN[d.desc] = d.descEn;
  return { name: d.name, desc: desc, seed: 5000 + L, hand: true, peak: L % 10 === 0, balls: d.balls || obBalls(L), powers: items, scene: d.scene, build: d.build };   // 12 Drohnen, Finale 13 (Bot-Bericht; Schwierigkeit kommt aus den Leveln)
}
var LEVELS = [];
for (var obL = 1; obL <= OB_LEVELS; obL++) LEVELS.push(obHandDef(obL, OB2_LEVELS[obL]));   // alle 150 Level sind handgebaut (OB2_LEVELS)

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

/* Steinbahn (OB2, Peggle-Stil): Kurve aus einzelnen Erzplatten, die Drohne rollt darauf, jeder berührte Stein wird aktiviert.
   Level liefern stoneRails: [{ shape, x, y, Größe …, rot, flip, spin, mv, z, g, b }]:
   x/y = Mittelpunkt (Drehpunkt), rot = feste Drehung, flip = gespiegelt, spin = Drehung der starren Bahn (rad/s), mv = Bewegung des
   Drehpunkts wie bei Brocken (mvAt, mit x/y), z/g/b = Anzahl Ziel-/Item-/Bonus-Steine (zf = Anteil Ziel-Steine), fit = ganz ins Feld schieben.
   Formen: arc (Kuppel, w), jump (Schanze, w), wave (Welle, w/amp/waves/ph), eight (Acht aus zwei Schleifen, R), ring (Ring mit Lücke oben, R/gap),
   utube (U-Rohr: Bogen mit senkrechten Geraden und Auslauf, R/h), spiral (Schnecke, r0/pitch/turns).
   Mulden (tiefster Punkt mitten in der Kurve) bekommen immer eine Lücke – sonst bliebe die Drohne darin liegen. */
function obStonePieces(d) {
  var out = [], P = Math.PI, i;
  function arcPts(cx, cy, R, a0, a1) { var n = Math.max(2, Math.ceil(Math.abs(a1 - a0) * R / 3)), o = []; for (i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; o.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R }); } return o; }
  function line(x0, y0, x1, y1) { var n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3)), o = []; for (i = 0; i <= n; i++) o.push({ x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n }); return o; }
  if (d.shape === 'arc') {                                           // Kuppel: Drohne rollt links oder rechts ab
    var sp = d.span || 2.2, R = d.w / (2 * Math.sin(sp / 2)), hh = R * (1 - Math.cos(sp / 2)) / 2;
    out.push(arcPts(0, R - hh, R, -P / 2 - sp / 2, -P / 2 + sp / 2));
  } else if (d.shape === 'jump') {                                   // Schanze: Viertel-Schale, tiefster Punkt am Ende – wirft die Drohne seitlich raus
    var a0 = 100 * P / 180, a1 = 175 * P / 180, Rj = d.w / (Math.cos(a0) - Math.cos(a1)), pts = arcPts(0, 0, Rj, a0, a1), mx = 0, my = 0;
    pts.forEach(function (q) { mx += q.x / pts.length; my += q.y / pts.length; });
    out.push(pts.map(function (q) { return { x: q.x - mx, y: q.y - my }; }));
  } else if (d.shape === 'wave') {                                   // Welle (die Täler bekommen ihre Lücke unten automatisch)
    var k = 2 * P * d.waves / d.w, wv = [];
    for (var x = -d.w / 2; x <= d.w / 2 + 0.01; x += 3) wv.push({ x: x, y: d.amp * Math.sin(k * (x + d.w / 2) + (d.ph || 0)) });
    out.push(wv);
  } else if (d.shape === 'ring' || d.shape === 'eight') {            // Ring: Einlass oben (gap = halber Winkel); Acht = zwei Ringe nebeneinander
    var Rr = d.R, ga = d.gap != null ? d.gap : Math.asin(Math.min(0.9, 24 / Rr)), cxs = d.shape === 'ring' ? [0] : [-(Rr + 24), Rr + 24];
    cxs.forEach(function (cx) { out.push(arcPts(cx, 0, Rr, -P / 2 + ga, 3 * P / 2 - ga)); });
  } else if (d.shape === 'utube') {                                  // U-Rohr (∩): Bogen oben, senkrechte Geraden, unten Auslauf nach außen
    var Ru = d.R, Lh = d.h / 2, f = d.flare || 26, top = arcPts(0, -Lh, Ru, P, 2 * P);
    var l = line(-Ru, -Lh, -Ru, Lh).reverse(), r = line(Ru, -Lh, Ru, Lh);
    out.push(arcPts(-Ru - f, Lh, f, 0, P / 2 - 0.35).reverse().concat(l.slice(1), top.slice(1), r.slice(1), arcPts(Ru + f, Lh, f, P, P / 2 + 0.35).slice(1)));
  } else if (d.shape === 'bar') {                                    // gerader Balken (Wippe, Förderband)
    out.push([{ x: -d.w / 2, y: 0 }, { x: d.w / 2, y: 0 }]);
  } else if (d.shape === 'spiral') {                                 // Schnecke von innen nach außen
    var sp2 = [], th = 0, thMax = (d.turns || 1.5) * 2 * P;
    for (; th <= thMax; th += 3 / (d.r0 + d.pitch * th / (2 * P))) { var rr = d.r0 + d.pitch * th / (2 * P); sp2.push({ x: rr * Math.cos(th + (d.ph || 0)), y: rr * Math.sin(th + (d.ph || 0)) }); }
    out.push(sp2);
  }
  var c = Math.cos(d.rot || 0), s = Math.sin(d.rot || 0), fx = d.flip ? -1 : 1;   // feste Drehung + Spiegeln, danach Mulden aufschneiden
  return out.map(function (pc) { return pc.map(function (q) { var x = q.x * fx; return { x: x * c - q.y * s, y: x * s + q.y * c }; }); })
    .reduce(function (acc, pc) { return acc.concat(obCutDips(pc, 2 * CFG.ballR + 12)); }, []).filter(function (q) { return q.length > 1 && railPath(q).total >= CFG.stoneLen; });   // keine Krümel
}
/* tiefste Stellen mitten in der Kurve (y größer als beide Nachbarn ein Stück weiter) mit Lücke ±gap aufschneiden */
function obCutDips(pc, gap) {
  var n = pc.length, K = 4, cut = new Uint8Array(n), i, j;
  for (i = K; i < n - K; i++) {
    if (!(pc[i].y >= pc[i - 1].y && pc[i].y >= pc[i + 1].y && pc[i].y > pc[i - K].y + 0.3 && pc[i].y > pc[i + K].y + 0.3)) continue;
    for (j = 0; j < n; j++) if (Math.hypot(pc[j].x - pc[i].x, pc[j].y - pc[i].y) < gap) cut[j] = 1;
  }
  var res = [], cur = [];
  for (i = 0; i < n; i++) { if (cut[i]) { if (cur.length > 1) res.push(cur); cur = []; } else cur.push(pc[i]); }
  if (cur.length > 1) res.push(cur);
  return res;
}
/* Bahn bauen: Steine (Brocken mit st: 1, Strecke x1/y1–x2/y2, lokal lx1…) + Gruppe rg (Drehpunkt, spin, mv) */
function buildStoneRail(d, rnd, powers) {
  var st = [], L = CFG.stoneLen, o1 = {}, o2 = {};
  obStonePieces(d).map(function (pc) { return d.hang ? pc.map(function (q) { return { x: q.x, y: q.y + d.hang }; }) : pc; }).forEach(function (pts) {   // hang: Bahn hängt so weit unter dem Drehpunkt (Pendel)
    var tr = railPath(pts), n = tr.total <= L ? 1 : Math.max(2, Math.round((tr.total - L) / CFG.stoneStep) + 1), len = Math.min(L, tr.total), step = n > 1 ? (tr.total - len) / (n - 1) : 0;
    for (var i = 0; i < n; i++) {
      railAt(tr, i * step, o1); railAt(tr, i * step + len, o2);
      st.push({ lx1: o1.x, ly1: o1.y, lx2: o2.x, ly2: o2.y, dl: Math.min(len, step || len) - 5 });   // gezeichnet etwas kürzer: sichtbare Fugen wie bei einzelnen Steinen
    }
  });
  var rg = { x: d.x, y: d.y, spin: d.swing ? d.swing.w : d.spin || 0, swing: d.swing || null, belt: d.belt || 0, mv: d.mv || null, px: d.x, py: d.y, vx: 0, vy: 0, w: 0 };   // swing = Pendel { a: Ausschlag (rad), w, p }
  if (d.fit && !rg.spin && !rg.mv) {                                 // ganz ins Feld schieben
    var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    st.forEach(function (s) { x0 = Math.min(x0, s.lx1, s.lx2); x1 = Math.max(x1, s.lx1, s.lx2); y0 = Math.min(y0, s.ly1, s.ly2); y1 = Math.max(y1, s.ly1, s.ly2); });
    rg.x = clamp(rg.x, 30 - x0, CFG.W - 30 - x1); rg.y = clamp(rg.y, CFG.top + 20 - y0, CFG.bot - y1); rg.px = rg.x; rg.py = rg.y;
  }
  st.forEach(function (s) { obStonePlace(rg, s); });
  var n = st.length, ord = shuffle(st.map(function (_, i) { return i; }), rnd), k = 0;   // Rollen: Ziel, Item, Bonus nur auf Steinen, die von oben frei liegen
  var open = function (i) { var s = st[i]; return Math.abs(Math.sin(s.a)) < 0.8 && !st.some(function (o) { return o !== s && o.y < s.y - 4 && s.y - o.y < 160 && s.x >= Math.min(o.x1, o.x2) - 4 && s.x <= Math.max(o.x1, o.x2) + 4; }); };
  ord = ord.filter(open).concat(ord.filter(function (i) { return !open(i); }));
  var nz = d.z != null ? d.z : Math.max(2, Math.round(n * (d.zf || 0.15))), ng = d.g || 0, nb = d.b || 0;
  st.forEach(function (s) { s.t = 'n'; s.sh = d.shade || 240; });
  for (; k < nz && k < n; k++) st[ord[k]].t = 'z';
  for (var j = 0; j < ng && k < n; j++, k++) { st[ord[k]].t = 'g'; st[ord[k]].power = powers && powers.length ? powers[Math.floor(rnd() * powers.length)] : 'bomb'; }
  for (j = 0; j < nb && k < n; j++, k++) st[ord[k]].t = 'b';
  rg.stones = st;
  return rg;
}
/* Lage der Gruppe zur Zeit t (Drehpunkt + Winkel) und Lage eines Steins daraus */
function obRailPose(rg, t, o) {
  if (rg.mv) mvAt(rg.mv, t, o); else { o.x = rg.x; o.y = rg.y; }
  o.a = rg.swing ? rg.swing.a * Math.sin(rg.swing.w * t + (rg.swing.p || 0)) : rg.spin * t; return o;
}
function obStonePlace(rg, s, pose) {
  var px = pose ? pose.x : rg.x, py = pose ? pose.y : rg.y, a = pose ? pose.a : 0, c = Math.cos(a), sn = Math.sin(a);
  s.x1 = px + s.lx1 * c - s.ly1 * sn; s.y1 = py + s.lx1 * sn + s.ly1 * c; s.x2 = px + s.lx2 * c - s.ly2 * sn; s.y2 = py + s.lx2 * sn + s.ly2 * c;
  s.x = (s.x1 + s.x2) / 2; s.y = (s.y1 + s.y2) / 2; s.a = Math.atan2(s.y2 - s.y1, s.x2 - s.x1);
}
/* Bewegungsraum einer Bahn: Raster (6 px) mit allen Stellen, an denen je ein Stein liegt – bewegte Bahnen über eine Periode bzw. 90 s abgetastet */
function obRailSweep(rails) {
  var S = 6, gw = Math.ceil(CFG.W / S), gh = Math.ceil(CFG.H / S), g = new Uint8Array(gw * gh), pose = {}, s2 = {};
  function mark(x, y) { var X = Math.round(x / S), Y = Math.round(y / S); if (X >= 0 && Y >= 0 && X < gw && Y < gh) g[Y * gw + X] = 1; }
  rails.forEach(function (rg) {
    var moving = rg.spin || rg.mv, T = !moving ? 0 : obRailPeriod(rg), dt = moving ? Math.min(0.25, 3 / CFG.stoneVMax) : 1;
    for (var t = 0; t <= T; t += dt) {
      obRailPose(rg, t, pose);
      rg.stones.forEach(function (s) { obStonePlace(rg, Object.assign(s2, s), pose); var n = Math.ceil(Math.hypot(s2.x2 - s2.x1, s2.y2 - s2.y1) / 4); for (var k = 0; k <= n; k++) mark(s2.x1 + (s2.x2 - s2.x1) * k / n, s2.y1 + (s2.y2 - s2.y1) * k / n); });
    }
  });
  return { near: function (x, y, R) {                                   // liegt ein Stein (Mittellinie) näher als R?
    var rc = Math.ceil((R + 9) / S), X = Math.round(x / S), Y = Math.round(y / S);
    for (var j = -rc; j <= rc; j++) for (var i = -rc; i <= rc; i++) { var a = X + i, b = Y + j; if (a < 0 || b < 0 || a >= gw || b >= gh || !g[b * gw + a]) continue; if (Math.hypot(i * S, j * S) <= R + 8.5) return true; }   // Rasterfehler höchstens 2 × 4,25 px: lieber etwas zu vorsichtig
    return false;
  } };
}
/* ponytail: Periode nur für eine Bewegungsart (Drehen ODER Drehpunkt-Bewegung), sonst 90 s abtasten */
function obRailPeriod(rg) { return rg.spin && rg.mv ? 90 : Math.min(90, 2 * Math.PI / Math.abs(rg.spin || rg.mv.w || 1)); }
/* ---- OB2 Phase 2: Werkzeugkasten für handgebaute Level ----
   Jede Funktion liefert Brocken-Listen [{x, y, (t, hp, power, mv)}]; Koordinaten im Feld 720 × 1280 (Spielzone y 170 … 1170, x 40 … 680).
   Formen:  row, arc, ring, grid, wave, spiral, eight, utube, star, diamond, heart, ship, path
   Lage:    move, rot, mirror (an x = cx), sym (Liste + Spiegelbild)
   Bewegung: spin (starre Drehung), slide (hin und her), lis (Acht/Lissajous, starre Gruppe), orbit (Ring kreist)
   Rollen:  z (Erzader), b (Bonus), g (Item), armor (Panzer 2–3), as (beliebig) – Auswahl: alle | [Index, … negativ = von hinten] | jedes k-te (Zahl) | Funktion(i, p)
   Teile:   rail (Steinbahn), wreck, well, ramp, track, gates (Paar) */
var OBK = (function () {
  var P = Math.PI;
  function pt(x, y) { return { x: x, y: y }; }
  function edges(pts, step, closed) {                     // Ecken-Formen: jede Kante gleichmäßig geteilt, Ecken immer belegt
    var o = [], n = pts.length, m = closed ? n : n - 1;
    for (var i = 0; i < m; i++) { var A = pts[i], B = pts[(i + 1) % n], k = Math.max(1, Math.round(Math.hypot(B.x - A.x, B.y - A.y) / step)); for (var j = 0; j < k; j++) o.push(pt(A.x + (B.x - A.x) * j / k, A.y + (B.y - A.y) * j / k)); }
    if (!closed) o.push(pt(pts[n - 1].x, pts[n - 1].y));
    return o;
  }
  function sel(l, pick) {
    if (pick == null) return l.map(function (_, i) { return i; });
    if (typeof pick === 'number') return l.map(function (_, i) { return i; }).filter(function (i) { return i % pick === 0; });
    if (typeof pick === 'function') return l.map(function (p, i) { return pick(i, p) ? i : -1; }).filter(function (i) { return i >= 0; });
    return pick.map(function (i) { return i < 0 ? l.length + i : i; }).filter(function (i) { return i >= 0 && i < l.length; });
  }
  var K = {
    row: function (x0, y0, x1, y1, n) { var o = []; for (var i = 0; i < n; i++) { var u = n > 1 ? i / (n - 1) : 0.5; o.push(pt(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u)); } return o; },
    arc: function (cx, cy, R, a0, a1, n) { var o = []; for (var i = 0; i < n; i++) { var a = a0 + (a1 - a0) * (n > 1 ? i / (n - 1) : 0.5); o.push(pt(cx + Math.cos(a) * R, cy + Math.sin(a) * R)); } return o; },
    ring: function (cx, cy, R, n, gap, at) {               // gap = halbe Lücke (rad) um den Winkel at (Standard oben)
      var o = [], c = at == null ? -P / 2 : at;
      for (var i = 0; i < n; i++) { var a = c + P + i * 2 * P / n, d = Math.abs(Math.atan2(Math.sin(a - c), Math.cos(a - c))); if (gap && d < gap) continue; o.push(pt(cx + Math.cos(a) * R, cy + Math.sin(a) * R)); }
      return o;
    },
    grid: function (x0, y0, cols, rows, dx, dy, hex) { var o = []; for (var r = 0; r < rows; r++) for (var c = 0; c < cols - (hex && r % 2 ? 1 : 0); c++) o.push(pt(x0 + c * dx + (hex && r % 2 ? dx / 2 : 0), y0 + r * dy)); return o; },
    wave: function (x0, x1, y, amp, waves, n, ph) { var o = []; for (var i = 0; i < n; i++) { var u = i / (n - 1); o.push(pt(x0 + (x1 - x0) * u, y + amp * Math.sin(2 * P * waves * u + (ph || 0)))); } return o; },
    spiral: function (cx, cy, r0, pitch, turns, step, ph) { return spiralArm(cx, cy, r0, pitch, turns, step, ph || 0); },
    eight: function (cx, cy, a, step, rot) {                // liegende Acht (Lemniskate), a = halbe Breite
      var d = []; for (var t = 0; t < 2 * P; t += 0.004) { var sn = Math.sin(t), q = 1 + sn * sn; d.push(pt(a * Math.cos(t) / q, a * sn * Math.cos(t) / q)); }
      return K.move(K.rot(pathPts(d, step, true), 0, 0, rot || 0), cx, cy);
    },
    utube: function (cx, cy, R, h, step) {                  // ∩: senkrechte Geraden (Länge h), oben ein Halbkreis
      var d = [pt(cx - R, cy + h)]; for (var a = P; a <= 2 * P + 1e-6; a += 0.05) d.push(pt(cx + Math.cos(a) * R, cy + Math.sin(a) * R)); d.push(pt(cx + R, cy + h));
      return pathPts([pt(cx - R, cy + h), pt(cx - R, cy)].concat(d.slice(1, -1), [pt(cx + R, cy), pt(cx + R, cy + h + 0.01)]), step, false);
    },
    star: function (cx, cy, R1, R2, k, step, rot) { return edges(starPts(cx, cy, R1, R2, k, rot == null ? -P / 2 : rot), step, true); },
    diamond: function (cx, cy, w, h, step) { return edges([pt(cx, cy - h / 2), pt(cx + w / 2, cy), pt(cx, cy + h / 2), pt(cx - w / 2, cy)], step, true); },
    heart: function (cx, cy, sc, step) { return heart(cx, cy, sc, step); },
    ship: function (cx, cy, s, step) {                      // Fregatten-Silhouette, Bug oben
      var h = [[0, -1], [0.16, -0.62], [0.2, -0.2], [0.55, 0.18], [0.62, 0.48], [0.24, 0.4], [0.2, 0.78], [0, 0.66]];
      var o = h.concat(h.slice(1, -1).reverse().map(function (q) { return [-q[0], q[1]]; })).map(function (q) { return pt(cx + q[0] * s, cy + q[1] * s); });
      return edges(o, step, true);
    },
    path: function (pts, step, closed) { return pathPts(pts.map(function (q) { return q.x != null ? q : pt(q[0], q[1]); }), step, closed); },
    move: function (l, dx, dy) { return l.map(function (p) { return Object.assign({}, p, { x: p.x + dx, y: p.y + dy }); }); },
    rot: function (l, cx, cy, a) { var c = Math.cos(a), sn = Math.sin(a); return l.map(function (p) { var x = p.x - cx, y = p.y - cy; return Object.assign({}, p, { x: cx + x * c - y * sn, y: cy + x * sn + y * c }); }); },
    mirror: function (l, cx) { cx = cx == null ? CFG.W / 2 : cx; return l.map(function (p) { return Object.assign({}, p, { x: 2 * cx - p.x }); }); },
    sym: function (l, cx) { return l.concat(K.mirror(l, cx)); },
    spin: function (l, cx, cy, w) { return spin(l, cx, cy, w).map(function (q, i) { return Object.assign({}, l[i], { mv: q.mv }); }); },
    slide: function (l, dx, dy, w, a0) { return l.map(function (p) { return Object.assign({}, p, { mv: { type: 'slide', x0: p.x - dx, x1: p.x + dx, y0: p.y - dy, y1: p.y + dy, w: w, a0: a0 || 0 } }); }); },
    lis: function (l, ax, ay, w, a0) { return lisGroup(l, { ax: ax, ay: ay, w: w, a0: a0 || 0, b: 2 }).map(function (q, i) { return Object.assign({}, l[i], { mv: q.mv }); }); },
    orbit: function (cx, cy, R, n, w, gap) { return orbitRing(cx, cy, R, n, { w: w, skip: gap }); },
    as: function (l, t, pick, extra) { sel(l, pick).forEach(function (i) { l[i].t = t; if (extra) Object.assign(l[i], extra); }); return l; },
    z: function (l, pick) { return K.as(l, 'z', pick); },
    b: function (l, pick) { return K.as(l, 'b', pick); },
    g: function (l, pick, power) { return K.as(l, 'g', pick, power ? { power: power } : null); },
    armor: function (l, hp, pick) { sel(l, pick).forEach(function (i) { l[i].hp = hp || 2; }); return l; },
    rail: function (shape, x, y, o) { return Object.assign({ shape: shape, x: x, y: y }, o || {}); },
    wreck: function (x, y, mv, r) { return { x: x, y: y, mv: mv, r: r }; },
    well: function (x, y, r, k, mv) { return { x: x, y: y, r: r, k: k, mv: mv }; },
    ramp: function (x1, y1, x2, y2) { return { x1: x1, y1: y1, x2: x2, y2: y2 }; },
    track: function (pts) { return pts.map(function (q) { return q.x != null ? q : pt(q[0], q[1]); }); },
    gates: function (x1, y1, x2, y2, mv1, mv2) { return [x1, y1, x2, y2, mv1, mv2]; },
    join: function () { return [].concat.apply([], arguments); },
    fade: function (l, w, p, step) { return l.map(function (q, i) { return Object.assign({}, q, { fade: { w: w, p: (p || 0) + i * (step || 0) } }); }); },   // Geisterbrocken: blinken, unsichtbar = durchlässig
    pulse: function (cx, cy, R, n, w, pa, pw, gap) { return orbitRing(cx, cy, R, n, { w: w, pa: pa, pw: pw || 1, skip: gap }); },   // Ring kreist und atmet
    squash: function (l, cx, cy, kx, ky) { return l.map(function (p) { return Object.assign({}, p, { x: cx + (p.x - cx) * kx, y: cy + (p.y - cy) * ky }); }); },
    wobble: function (l, ax, w, k) { return l.map(function (p) { return Object.assign({}, p, { mv: { type: 'slide', x0: p.x - ax, x1: p.x + ax, y0: p.y, y1: p.y, w: w, a0: p.y * k } }); }); },   // Doppelhelix: Phase nach Höhe
    /* Aufräumen am Ende jedes Levels: Brocken weg, die (a) einer festen Steinbahn näher als Brockenradius + halbe Steindicke + Drohnendurchmesser kommen,
       (b) im Bewegungsraum bewegter Brocken liegen oder (c) einem anderen Brocken so nahe sind, dass ein Klemmspalt entstünde (Abstand < 39).
       Erzadern, Items und Bonus bleiben bevorzugt stehen. Liefert die Liste zurück. */
    tidy: function (l, o, keepD) {
      if (Array.isArray(o)) o = { rails: o };                  // alt: tidy(pegs, rails)
      o = o || {};
      var segs = [], sweeps = [], railD = CFG.pegR + CFG.stoneHalf + 2 * CFG.ballR + 3, trackD = CFG.pegR + CFG.railHalf + 2 * CFG.ballR + 3;
      (o.rails || []).forEach(function (d) {
        if (d.spin || d.mv || d.swing) { sweeps.push(obRailSweep([buildStoneRail(d, mulberry32(1), ['bomb'])])); return; }
        obStonePieces(d).forEach(function (pc) { for (var i = 1; i < pc.length; i++) segs.push([pc[i - 1].x + d.x, pc[i - 1].y + d.y, pc[i].x + d.x, pc[i].y + d.y, railD]); });
      });
      (o.tracks || []).forEach(function (tr) { for (var i = 1; i < tr.length; i++) segs.push([tr[i - 1].x, tr[i - 1].y, tr[i].x, tr[i].y, trackD]); });
      (o.ramps || []).forEach(function (r) { segs.push([r.x1, r.y1, r.x2, r.y2, trackD]); });
      var obst = [];                                            // Wracks, Tore, Felder-Mitte: Abstand ohne Klemmspalt
      (o.wrecks || []).forEach(function (w) { obst.push({ x: w.x, y: w.y, d: (w.r || CFG.wreckR) + CFG.pegR + 2 * CFG.ballR + 4, mv: w.mv }); });
      (o.gates || []).forEach(function (g) { obst.push({ x: g[0], y: g[1], d: 46, mv: g[4] }); obst.push({ x: g[2], y: g[3], d: 46, mv: g[5] }); });
      var movObst = obst.filter(function (q) { return q.mv; }), occO = movObst.length ? occGrid(movObst.map(function (q) { return { x: q.x, y: q.y, mv: q.mv }; }), 52) : null;
      var movers = l.filter(function (p) { return p.mv; }), occ = movers.length ? occGrid(movers, 2 * CFG.pegR + 6) : null;
      var rank = function (p) { return p.t === 'z' ? 0 : p.t === 'g' ? 1 : p.t === 'b' ? 2 : 3; };
      var close = o.tight ? function (d) { return d < 22 || (d >= 29.5 && d < (keepD || 39)); } : function (d) { return d < (keepD || 39); };   // tight: Ziegelwände (Abstand < 30) erlaubt
      var order = l.map(function (p, i) { return i; }).sort(function (a, c) { return rank(l[a]) - rank(l[c]) || a - c; }), kept = [], out = [], keptMv = [];
      function track(p) { var o2 = { x: 0, y: 0 }, tr = []; for (var t = 0; t <= 40; t += 0.25) { mvAt(p.mv, t, o2); tr.push(o2.x, o2.y); } return tr; }
      function badMover(p, tr) {                                // bewegter Brocken: im Feld, nie an Bahnen/Wracks/anderen bewegten Brocken
        for (var k = 0; k < tr.length; k += 2) {
          var x = tr[k], y = tr[k + 1];
          if (x < CFG.pegR + 2 || x > CFG.W - CFG.pegR - 2 || y < CFG.top - 20 || y > CFG.bot + 20) return true;
          if (segs.some(function (s) { return segNear(x, y, s[0], s[1], s[2], s[3]).d < s[4]; })) return true;
          if (sweeps.some(function (sw) { return sw.near(x, y, railD); })) return true;
          if (obst.some(function (q) { return !q.mv && Math.hypot(q.x - x, q.y - y) < q.d; })) return true;
          for (var m = 0; m < keptMv.length; m++) if (Math.hypot(keptMv[m][k] - x, keptMv[m][k + 1] - y) < 2 * CFG.pegR + 3) return true;
        }
        return false;
      }
      order.forEach(function (i) {
        var p = l[i];
        if (p.mv) { var tr = track(p); if (badMover(p, tr)) return; keptMv.push(tr); out.push(i); return; }
        if (!p.mv && (p.x < 30 || p.x > CFG.W - 30 || p.y < CFG.top - 10 || p.y > CFG.bot + 15)) return;
        if (segs.some(function (s) { return segNear(p.x, p.y, s[0], s[1], s[2], s[3]).d < s[4]; })) return;
        if (sweeps.some(function (sw) { return sw.near(p.x, p.y, railD); })) return;
        if (!p.mv) {
          if (occ && occ.hit(p.x, p.y)) return;
          if (occO && occO.hit(p.x, p.y)) return;
          if (obst.some(function (q) { return !q.mv && Math.hypot(q.x - p.x, q.y - p.y) < q.d; })) return;
          if (kept.some(function (q) { return close(Math.hypot(q.x - p.x, q.y - p.y)); })) return;
          kept.push(p);
        }
        out.push(i);
      });
      return out.sort(function (a, c) { return a - c; }).map(function (i) { return l[i]; });
    }
  };
  return K;
})();
function obHandPegs(specs, rnd, powers) {
  var pw = (powers || []).slice();
  return specs.map(function (p, i) {
    var shape = []; for (var s = 0; s < 8; s++) shape.push(0.86 + rnd() * 0.22);
    var q = { id: i, x: p.x, y: p.y, r: CFG.pegR, t: p.t || 'n', lit: false, gone: false, rot: rnd() * 6.283, shape: shape };
    if (q.t === 'g') q.power = p.power || pw.shift() || 'bomb';
    if (p.mv) q.mv = p.mv;
    if (p.fade && q.t !== 'z') q.fade = p.fade;   // Erzadern blinken nie (sonst Glückssache)
    if (p.hp > 1) { q.hp = p.hp; q.hpMax = p.hp; }
    return q;
  });
}
function buildLevel(def) {
  var b = def.build(OBK), rnd = mulberry32(def.seed ^ 0x9e3779b1);
  b.specs = b.specs || b.pegs || [];
  if (b.gatePairs) b.gates = (b.gates || []).concat(b.gatePairs.reduce(function (acc, gp) { var n = (b.gates || []).length + acc.length; return acc.concat([{ x: gp[0], y: gp[1], link: n + 1, mv: gp[4] }, { x: gp[2], y: gp[3], link: n, mv: gp[5] }]); }, []));
  var lr = mulberry32((def.seed ^ 0x1B873593) >>> 0), rails = (b.stoneRails || []).map(function (d) { return buildStoneRail(d, lr, def.powers); });   // Steinbahnen: eigener Zufall
  var pegs = obHandPegs(b.specs, rnd, def.powers);
  (b.wrecks || []).forEach(function (w) {
    pegs.push({ id: pegs.length, x: w.x, y: w.y, r: w.r || CFG.wreckR, t: 'w', lit: false, gone: false, rot: rnd() * 6.283, shape: [1, 0.82, 1.08, 0.88, 1, 0.8, 1.1, 0.9], mv: w.mv });
  });
  var gates = (b.gates || []).map(function (g) { return { x: g.x, y: g.y, link: g.link, r: CFG.gateR, mv: g.mv }; });
  rails.forEach(function (rg, ri) {
    rg.stones.forEach(function (s) {
      var q = { id: pegs.length, x: s.x, y: s.y, r: CFG.stoneHalf, t: s.t, lit: false, gone: false, rot: 0, shape: [1, 1, 1, 1, 1, 1, 1, 1], st: 1, rg: ri, x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2, a: s.a, dl: s.dl, lx1: s.lx1, ly1: s.ly1, lx2: s.lx2, ly2: s.ly2 };
      if (s.power) q.power = s.power; pegs.push(q);
    });
    delete rg.stones;                                              // Steine stecken in pegs (rg-Index), die Gruppe hält nur Lage und Bewegung
  });
  var wells = (b.wells || []).map(function (w) { return { x: w.x, y: w.y, r: w.r, k: w.k, mv: w.mv }; });
  return { pegs: pegs, gates: gates, wells: wells, ramps: b.ramps || [], tracks: (b.tracks || []).map(railPath), stoneRails: rails };
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
    built = buildLevel(def); this.pegs = built.pegs; this.gates = built.gates; this.wells = built.wells; this.ramps = built.ramps; this.tracks = built.tracks; this.stoneRails = built.stoneRails;
    this.ballsLeft = def.balls || CFG.balls;
  } else {
    this.level = 0;
    if (seed == null) seed = Math.floor(Math.random() * 4294967294) + 1;
    this.seed = seed >>> 0; this.levelName = 'Zufallsfeld'; this.levelDesc = 'Zufällige Anordnung';
    this.pegs = makeLayout(this.seed); this.gates = []; this.wells = []; this.ramps = []; this.tracks = []; this.stoneRails = []; this.ballsLeft = CFG.balls;
  }
  this.rs = (this.seed ^ 0x5bd1e995) | 0;
  this.shotScore = 0; this.shotHits = 0; this.hitsTotal = 0; this.bonus = 0; this.caught = 0; this.bestCombo = 0; this.comboTotal = 0;
  this.shotCaught = false; this.volley = false; this.net = 0; this.mt = 0; this.frozen = 0; this.slow = false; this.dbl = false;
  this.bestSlide = 0; this.slideTotal = 0; this.traceShots = 0; this.frost = false; this.overload = false; this.shotZ = 0;   // OB2 1b
  var n = 0; for (var i = 0; i < this.pegs.length; i++) if (this.pegs[i].t === 'z') n++;
  this.targetsTotal = n; this.targetsLeft = n;
  this.status = 'aiming';            // aiming | flying | won | lost
  this.balls = []; this.aim = 0; this.time = 0; this.acc = 0;
  this.bucket = { x: CFG.W / 2, y: CFG.bucketY, w: CFG.bucketW, dir: 1 };
  this.events = []; this.levelStartScore = this.score; this._sg = null;
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
  var t = this.mt || 0, lists = [this.pegs, this.gates || [], this.wells || []], rs = this.stoneRails || [], moved = false, i;
  for (var k = 0; k < 3; k++) for (i = 0; i < lists[k].length; i++) { var p = lists[k][i]; if (p.mv) mvAt(p.mv, t, p); }
  for (i = 0; i < rs.length; i++) {                                  // Steinbahnen: Lage jetzt und Oberflächentempo (aus t und t − h)
    var rg = rs[i]; if (!rg.spin && !rg.mv) continue;
    var a = obRailPose(rg, t, {}), b = obRailPose(rg, t - 1 / 240, {}), still = this.frozen > 0;
    rg.px = a.x; rg.py = a.y; rg.ang = a.a; rg.vx = still ? 0 : (a.x - b.x) * 240; rg.vy = still ? 0 : (a.y - b.y) * 240; rg.w = still ? 0 : (a.a - b.a) * 240;
    moved = true;
  }
  if (moved) for (i = 0; i < this.pegs.length; i++) { var s = this.pegs[i]; if (s.st && (rs[s.rg].spin || rs[s.rg].mv)) obStonePlace(rs[s.rg], s, { x: rs[s.rg].px, y: rs[s.rg].py, a: rs[s.rg].ang }); }
  if (moved || !this._sg) this._stoneGrid();
};
/* Raster für Steine (Zelle 48 px): die Drohne prüft nur die Steine in ihrer Nähe */
Game.prototype._stoneGrid = function () {
  var C = CFG.stoneCell, m = {}, P = this.pegs;
  for (var i = 0; i < P.length; i++) {
    var p = P[i]; if (!p.st) continue;
    var x0 = Math.floor((Math.min(p.x1, p.x2) - p.r) / C), x1 = Math.floor((Math.max(p.x1, p.x2) + p.r) / C), y0 = Math.floor((Math.min(p.y1, p.y2) - p.r) / C), y1 = Math.floor((Math.max(p.y1, p.y2) + p.r) / C);
    for (var gy = y0; gy <= y1; gy++) for (var gx = x0; gx <= x1; gx++) (m[gx + ',' + gy] || (m[gx + ',' + gy] = [])).push(i);
  }
  this._sg = m;
};
Game.prototype._stonesNear = function (x, y, R, out) {
  var C = CFG.stoneCell, m = this._sg || {}, st = (this._sgN = (this._sgN || 0) + 1);
  out.length = 0;
  for (var gy = Math.floor((y - R) / C); gy <= Math.floor((y + R) / C); gy++) for (var gx = Math.floor((x - R) / C); gx <= Math.floor((x + R) / C); gx++) {
    var l = m[gx + ',' + gy]; if (!l) continue;
    for (var k = 0; k < l.length; k++) { var p = this.pegs[l[k]]; if (p._sv !== st) { p._sv = st; out.push(p); } }
  }
  return out;
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
  var s = Math.sin(a), c = Math.cos(a), h = CFG.sub;
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
  return { x: x, y: y, vx: vx, vy: vy, r: CFG.ballR, t: 0, cpT: 0, cx: x, cy: y, pierce: 0, tractor: false, gateCd: 0, slideN: 0, railT: 9 };
}
Game.prototype.fire = function () {
  if (this.status !== 'aiming' || this.ballsLeft <= 0) return false;
  var angles = this.volley ? [-CFG.volleySpread, 0, CFG.volleySpread] : [0], volley = this.volley, self = this;
  this.balls = angles.map(function (d) {
    var a = clamp(self.aim + d, -1.5, 1.5), s = Math.sin(a), c = Math.cos(a);
    return newBall(CFG.launcherX + s * CFG.muzzle, CFG.launcherY + c * CFG.muzzle, s * CFG.launchSpeed, c * CFG.launchSpeed);
  });
  this.volley = false;
  this.ballsLeft--; this.status = 'flying'; this.shotHits = 0; this.shotScore = 0; this.acc = 0; this.shotCaught = false; this.shotZ = 0;
  if (this.traceShots > 0) this.traceShots--;                       // Zielscanner zählt je Schuss
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
  if (p.t === 'z') {
    this.targetsLeft--; this.shotZ++;
    if (this.shotZ === 4) this._skill('rush', 500, p.x, p.y);                          // Erz-Ansturm: 4 Erzadern in einem Schuss
    if (withBoom && ball) {
      if (ball.lastZ && Math.hypot(p.x - ball.lastZ.x, p.y - ball.lastZ.y) > 380) this._skill('long', 250, p.x, p.y);   // Langer Schuss
      if (ball.wallT > 0 && !ball.bank) { ball.bank = true; this._skill('bank', 200, p.x, p.y); }                       // Querbande
      ball.lastZ = { x: p.x, y: p.y };
    }
    if (this.targetsLeft === 0 && this.status === 'flying') this.events.push({ type: 'lastHit', x: p.x, y: p.y });
  }
  this.events.push({ type: 'hit', id: p.id, x: p.x, y: p.y, pts: pts, t: p.t, power: p.power, mult: mult, st: !!p.st });
  if (withBoom && this.overload && !p.st && p.t !== 'g') {                              // Überladung: 2 nächste Brocken mit
    var ov = this.pegs.filter(function (q) { return q !== p && !q.gone && !q.lit && !q.st && q.t !== 'w' && q.t !== 'g'; });
    ov.sort(function (a, c) { return Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(c.x - p.x, c.y - p.y); });
    ov.slice(0, 2).forEach(function (q) { this.events.push({ type: 'zap', x: p.x, y: p.y, x2: q.x, y2: q.y }); this._lightPeg(q, false, ball); }, this);
  }
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
  else if (kind === 'trace') this.traceShots = 3;
  else if (kind === 'slideboost' && ball) ball.slideBoost = true;
  else if (kind === 'frost') this.frost = true;
  else if (kind === 'overload') this.overload = true;
  else if (kind === 'rockfall' && ball) { ball.rock = true; ball.r = CFG.ballR * 2.2; ball.rockFree = true; this.ballsLeft++; this.events.push({ type: 'rock', x: ball.x, y: ball.y }); }
  else if (kind === 'phantom' && ball) {                            // graue Brocken durchfliegbar, bis zu 12 verbrauchte kehren als Geister zurück
    ball.phantomT = 2.5;
    var gs = this.pegs.filter(function (q) { return q.gone && !q.st && q.t !== 'w' && q.t !== 'g'; });
    gs.sort(function (a, c) { return Math.hypot(a.x - ball.x, a.y - ball.y) - Math.hypot(c.x - ball.x, c.y - ball.y); });
    gs.slice(0, 12).forEach(function (q) { q.gone = false; q.lit = false; q.ghost = true; q.t = 'n'; delete q.hp; });
  }
  else if (kind === 'revive') {                                     // 6 verbrauchte graue Brocken kommen zurück (keine Ziele, keine Steine)
    var rv = this.pegs.filter(function (q) { return q.gone && !q.st && q.t === 'n' && !q.ghost; });
    for (var ri = 0; ri < 6 && rv.length; ri++) { var rq = rv.splice(Math.floor(this._rand() * rv.length), 1)[0]; rq.gone = false; rq.lit = false; this.events.push({ type: 'revive', x: rq.x, y: rq.y }); }
  }
  else if (kind === 'jump' && ball) {                               // springt auf eine zufällige Erzader und trifft sie
    var jz = this.pegs.filter(function (q) { return q.t === 'z' && !q.gone && !q.lit; });
    if (jz.length) {
      var jq = jz[Math.floor(this._rand() * jz.length)];
      this.events.push({ type: 'warp', x: ball.x, y: ball.y, x2: jq.x, y2: jq.y - jq.r - ball.r - 2 });
      ball.x = jq.x; ball.y = jq.y - jq.r - ball.r - 2; ball.vx = (this._rand() - 0.5) * 80; ball.vy = -120; ball.cx = ball.x; ball.cy = ball.y; ball.cpT = 0;
      if (jq.hp > 1) jq.hp = 1; this._lightPeg(jq, true, ball);
    }
  }
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
Game.prototype._kinetic = function (h) {
  var P = this.pegs, k, q, any = false;
  for (var i = 0; i < P.length; i++) {
    var p = P[i]; if (!(p.kt > 0) || p.gone) continue; any = true;
    p.kt -= h; var dmp = Math.max(0, 1 - 2.2 * h); p.kvx *= dmp; p.kvy *= dmp;
    var nx = p.x + p.kvx * h, ny = p.y + p.kvy * h;
    if (nx < p.r || nx > CFG.W - p.r) { p.kvx = -p.kvx; nx = clamp(nx, p.r, CFG.W - p.r); }
    if (ny < CFG.top - 20 || ny > CFG.bot + 30) { p.kvy = -p.kvy; ny = clamp(ny, CFG.top - 20, CFG.bot + 30); }
    var blocked = false;
    for (k = 0; k < P.length; k++) {
      q = P[k]; if (q === p || q.gone || q.ghost) continue;
      if (q.st) { if (!q.used && segNear(nx, ny, q.x1, q.y1, q.x2, q.y2).d < p.r + q.r) blocked = true; continue; }   // Steinbahnen halten den Brocken auf
      var dx = q.x - nx, dy = q.y - ny, rr = p.r + q.r;
      if (dx * dx + dy * dy >= rr * rr) continue;
      if (q.t === 'w') { blocked = true; continue; }
      if (!q.lit) {                                                  // anstoßen: Treffer + Schwung weitergeben (Kettenreaktion)
        this._lightPeg(q, false, this.balls[0]);
        var d = Math.hypot(dx, dy) || 1, sp = Math.hypot(p.kvx, p.kvy) * 0.8;
        if (!(q.hp > 1)) { q.kvx = dx / d * sp; q.kvy = dy / d * sp; q.kt = 0.7; delete q.mv; }
      }
      blocked = true;
    }
    if (blocked) { p.kt = 0; continue; }
    p.x = nx; p.y = ny;
  }
  return any;
};
Game.prototype._sub = function (h) {
  this._moveBucket(h);
  if (this.frost) this._kinetic(h);
  for (var i = this.balls.length - 1; i >= 0 && this.status === 'flying'; i--) {
    if (this.balls[i]) this._subBall(this.balls[i], h, i);
  }
};
Game.prototype._subBall = function (b, h, idx) {
  var W = CFG.W, H = CFG.H, i, p, bk = this.bucket;
  b.railT = (b.railT || 0) + h; if (b.wallT > 0) b.wallT -= h; if (b.phantomT > 0) b.phantomT -= h;
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
  if (b.x < b.r) { b.x = b.r; if (b.vx < 0) { if (b.vx < -200) b.wallT = 0.6; b.vx = -b.vx * CFG.restWall; } }   // wallT: Querbande möglich
  else if (b.x > W - b.r) { b.x = W - b.r; if (b.vx > 0) { if (b.vx > 200) b.wallT = 0.6; b.vx = -b.vx * CFG.restWall; } }
  if (b.y < b.r) { b.y = b.r; if (b.vy < 0) b.vy = -b.vy * CFG.restWall; }
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp > CFG.maxSpeed) { b.vx *= CFG.maxSpeed / sp; b.vy *= CFG.maxSpeed / sp; }
  b.pl = (b.pl || 0) + Math.min(sp, CFG.maxSpeed) * h;                // zurückgelegter Weg (Steinbahn: langsames Rollen ist kein Festhänger)
  var near = this._stonesNear(b.x, b.y, b.r + CFG.stoneHalf, this._near || (this._near = []));
  for (i = 0; i < near.length; i++) {              // Steinbahn: Kapsel; kleiner Rückprall, Tempo entlang der Bahn bleibt (wenig Reibung)
    p = near[i];
    if (p.used) continue;                          // abgebaut: durchlässig (Nutzerwunsch wie in OmniBreaker 1)
    var sq = segNear(b.x, b.y, p.x1, p.y1, p.x2, p.y2), sr = b.r + p.r;
    if (sq.d >= sr) continue;
    var snx, sny, rg = this.stoneRails[p.rg], ox = 0, oy = 0;
    if (sq.d > 0.0001) { snx = (b.x - sq.x) / sq.d; sny = (b.y - sq.y) / sq.d; } else { snx = Math.sin(p.a); sny = -Math.cos(p.a); if (sny > 0) { snx = -snx; sny = -sny; } }
    b.x = sq.x + snx * sr; b.y = sq.y + sny * sr; b.onSt = true;   // entlang der Normalen heraus – nie hindurch
    if (rg && (rg.spin || rg.mv)) { ox = rg.vx - rg.w * (sq.y - rg.py); oy = rg.vy + rg.w * (sq.x - rg.px); }   // bewegte Bahn: im mitbewegten Bezugssystem rechnen
    var belt = rg && rg.belt;
    if (belt) { var bl = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1; ox += (p.x2 - p.x1) / bl * belt; oy += (p.y2 - p.y1) / bl * belt; }   // Förderband: Oberfläche läuft mit
    var rvx = b.vx - ox, rvy = b.vy - oy, svn = rvx * snx + rvy * sny;
    if (svn < 0) {
      rvx -= (1 + CFG.stoneRest) * svn * snx; rvy -= (1 + CFG.stoneRest) * svn * sny;
      var stx = -sny, sty = snx, svt = rvx * stx + rvy * sty, sf = svt * Math.min(1, (belt ? 6 : CFG.stoneFric) * h);
      b.vx = rvx - sf * stx + ox; b.vy = rvy - sf * sty + oy;
    }
    var fresh = !p.lit && !p.used;
    this._lightPeg(p, true, b);
    b.railT = 0; b.spx = sq.x; b.spy = sq.y;                          // Gleiter: Bahnkontakt hält die Kette
    if (fresh && p.lit) b.slideN = (b.slideN || 0) + 1;              // jeder Stein nur einmal
  }
  for (i = 0; i < this.pegs.length; i++) {
    p = this.pegs[i];
    if (p.gone || p.st) continue;
    if (p.fade && Math.sin(p.fade.w * this.mt + p.fade.p) < 0) continue;   // Geisterbrocken gerade unsichtbar: durchlässig
    if (p.ghost || (b.phantomT > 0 && p.t === 'n' && !(p.hp > 1)) || (b.rock && p.t !== 'w')) {   // Geister, Phantom (grau), Felsbrecher: durchfliegen
      var gx2 = b.x - p.x, gy2 = b.y - p.y, gr2 = b.r + p.r;
      if (gx2 * gx2 + gy2 * gy2 < gr2 * gr2 && !p.lit) { if (b.rock && p.hp > 1) p.hp = 1; this._lightPeg(p, true, b); }
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
    if (this.frost && p.t !== 'w' && !(p.hp > 1)) { var ks = Math.max(160, -vn * 0.55); p.kvx = -nx * ks; p.kvy = -ny * ks; p.kt = 0.9; delete p.mv; }   // Frostschlag
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
  if (b.slideN && b.railT > (b.slideBoost ? 0.6 : 0.25)) this._endSlide(b);   // Bahn verlassen: Kette endet
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
      if (vn < -80) { this.events.push({ type: 'bump', x: qx, y: qy, id: 'hull' }); b.kicked = true; }   // Frachter-Tritt möglich
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
    b.railT = 0;
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
  b.t += h; b.cx = b.x; b.cy = b.y; b.cpT = 0; b.railT = 0;
  if (R.s <= 0 || R.s >= tr.total) { delete b.rail; b.railCd = CFG.railCd; this.events.push({ type: 'railOut', x: b.x, y: b.y }); }
  return true;
};
/* Gleiter-Bonus: ab 6 Steinen 20 · n · (n − 5), ab 12 („Extremer Gleiter“) doppelt; Gleitschub ×2; zählt mit Faktor */
Game.slideBonus = function (n) { return n >= 6 ? 20 * n * (n - 5) * (n >= 12 ? 2 : 1) : 0; };
Game.prototype._endSlide = function (b) {
  var n = b.slideN || 0; b.slideN = 0;
  if (n > this.bestSlide) this.bestSlide = n;
  var pts = Game.slideBonus(n) * (b.slideBoost ? 2 : 1) * this.multiplier() * (this.dbl ? 2 : 1);
  if (!pts) return;
  this.score += pts; this.shotScore += pts; this.slideTotal += pts;
  this.events.push({ type: 'slide', n: n, pts: pts, extreme: n >= 12, x: b.x, y: b.y });
};
/* Geschicklichkeitsschüsse: kleiner fester Bonus + Banner */
Game.prototype._skill = function (kind, pts, x, y) { this.score += pts; this.shotScore += pts; this.events.push({ type: 'skill', kind: kind, pts: pts, x: x, y: y }); };
Game.prototype._removeBall = function (idx, reason) {
  var rb = this.balls[idx];
  if (rb) this._endSlide(rb);
  if (rb && reason === 'catch' && rb.kicked) this._skill('kick', 300, this.bucket.x, this.bucket.y - 30);
  if (rb && reason === 'catch' && rb.rockFree && this.shotCaught) this.ballsLeft++;   // Felsbrecher: Gratis-Drohne im Fangkorb, auch wenn schon eine gefangen wurde
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
    if (p.gone || !p.lit || p.st) continue;                          // Steinbahnen bleiben immer
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
  this.slow = false; this.dbl = false; this.frost = false; this.overload = false; this.wells = (this.wells || []).filter(function (w) { return !w.tmp; });
  for (i = 0; i < this.pegs.length; i++) { p = this.pegs[i]; p.kt = 0; if (p.ghost) { p.ghost = false; p.gone = true; } }   // Geister verschwinden wieder
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
/* Zielscanner: Flugbahn mit Abprallern an Brocken und Steinen (ohne zu treffen), bis 1,6 s; first = Index des ersten Abpralls */
Game.prototype.predictLong = function (angle) {
  var a = angle == null ? this.aim : angle, h = CFG.sub, x = CFG.launcherX + Math.sin(a) * CFG.muzzle, y = CFG.launcherY + Math.cos(a) * CFG.muzzle;
  var vx = Math.sin(a) * CFG.launchSpeed, vy = Math.cos(a) * CFG.launchSpeed, pts = [{ x: x, y: y }], first = -1, acc = { ax: 0, ay: 0 }, near = [];
  for (var i = 0; i < 1.6 / h; i++) {
    if (this.wells && this.wells.length) { this._wellAcc(x, y, acc); vx += acc.ax * h; vy += acc.ay * h; }
    vy += CFG.gravity * h; x += vx * h; y += vy * h;
    if (x < CFG.ballR) { x = CFG.ballR; vx = -vx * CFG.restWall; } else if (x > CFG.W - CFG.ballR) { x = CFG.W - CFG.ballR; vx = -vx * CFG.restWall; }
    var nx = 0, ny = 0, rest = 0, hit = false;
    this._stonesNear(x, y, CFG.ballR + CFG.stoneHalf, near).forEach(function (p) { if (p.used) return; var q = segNear(x, y, p.x1, p.y1, p.x2, p.y2); if (q.d < CFG.ballR + p.r) { hit = true; nx = (x - q.x) / (q.d || 1); ny = (y - q.y) / (q.d || 1); rest = CFG.stoneRest; x = q.x + nx * (CFG.ballR + p.r); y = q.y + ny * (CFG.ballR + p.r); } });
    for (var k = 0; k < this.pegs.length && !hit; k++) {
      var p = this.pegs[k]; if (p.gone || p.st || p.ghost) continue;
      var dx = x - p.x, dy = y - p.y, rr = CFG.ballR + p.r;
      if (dx * dx + dy * dy < rr * rr) { var d = Math.sqrt(dx * dx + dy * dy) || 1; nx = dx / d; ny = dy / d; rest = p.t === 'w' ? CFG.restWreck : CFG.restPeg; x = p.x + nx * rr; y = p.y + ny * rr; hit = true; }
    }
    if (hit) { var vn = vx * nx + vy * ny; if (vn < 0) { vx -= (1 + rest) * vn * nx; vy -= (1 + rest) * vn * ny; } if (first < 0) { first = pts.length; pts.push({ x: x, y: y, hit: true }); } }
    if (i % 4 === 0) pts.push({ x: x, y: y });
    if (y > CFG.H) break;
  }
  return { pts: pts, first: first };
};
Game.prototype.predict = function (angle) {
  var a = angle == null ? this.aim : angle, s = Math.sin(a), c = Math.cos(a), h = CFG.sub;
  var x = CFG.launcherX + s * CFG.muzzle, y = CFG.launcherY + c * CFG.muzzle;
  var vx = s * CFG.launchSpeed, vy = c * CFG.launchSpeed, pts = [{ x: x, y: y }];
  var acc = { ax: 0, ay: 0 }, wl = this.wells && this.wells.length;
  for (var i = 0; i < 2 / h; i++) {                                  // 2 s Flug
    if (wl) { this._wellAcc(x, y, acc); vx += acc.ax * h; vy += acc.ay * h; }
    vy += CFG.gravity * h; x += vx * h; y += vy * h;
    if (x < CFG.ballR) { x = CFG.ballR; vx = -vx * CFG.restWall; }
    else if (x > CFG.W - CFG.ballR) { x = CFG.W - CFG.ballR; vx = -vx * CFG.restWall; }
    var hit = false;
    for (var k = 0; k < this.pegs.length; k++) {
      var p = this.pegs[k];
      if (p.gone) continue;
      if (p.st) { if (!p.used && segNear(x, y, p.x1, p.y1, p.x2, p.y2).d < CFG.ballR + p.r) { hit = true; break; } continue; }   // Steinbahn (auch verbraucht fest)
      if (p.fade && Math.sin(p.fade.w * this.mt + p.fade.p) < 0) continue;
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
  mega:    { base: '#8a5a2a', hi: '#ffe0b0', glow: '#ffb060' },
  trace:      { base: '#2a8a70', hi: '#c0fff0', glow: '#5effd0' },
  phantom:    { base: '#4e5280', hi: '#e8eaff', glow: '#b4baff' },
  slideboost: { base: '#b07e10', hi: '#fff0b0', glow: '#ffcf3c' },
  rockfall:   { base: '#6a5643', hi: '#efdcc4', glow: '#d0a070' },
  jump:       { base: '#1f8f60', hi: '#b8ffdc', glow: '#3cf09a' },
  revive:     { base: '#6f8f1f', hi: '#eaffb4', glow: '#b6f040' },
  frost:      { base: '#3f80c0', hi: '#e6f6ff', glow: '#a6dcff' },
  overload:   { base: '#b8327e', hi: '#ffc6ea', glow: '#ff5ac8' }
};
function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = obT(text);
  return n;
}

/* Logo (14.10.2026, Entwurf 3, kleine Fassung aus OmniBreaker/logo/omnibreaker-logo-klein.svg): Omni-Ring gebrochen, E aus Steinen, Ball schlägt ein Stück ab */
var OB_LOGO = '<path d="M256 62 A194 194 0 1 0 446 300" fill="none" stroke="#ff8a2a" stroke-width="46" stroke-linecap="round"/><polygon points="334,44 400,60 378,122 322,100" fill="#ff8a2a"/>' +
  '<rect x="132" y="116" width="54" height="280" rx="10" fill="#4fd8ff"/><rect x="200" y="116" width="114" height="52" rx="10" fill="#4fd8ff"/><rect x="200" y="230" width="144" height="52" rx="10" fill="#f0a030"/><rect x="200" y="344" width="180" height="52" rx="10" fill="#4fd8ff"/>' +
  '<path d="M210 296 L370 138" stroke="#ffb347" stroke-width="30" stroke-linecap="round" opacity=".55"/><circle cx="390" cy="118" r="54" fill="#fff4cf" stroke="#ffb347" stroke-width="14"/>';
function makeLogo(size) {
  var z = String(size || 34), svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 512 512'); svg.setAttribute('width', z); svg.setAttribute('height', z); svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'ob-logo'); svg.style.alignSelf = 'center'; svg.style.flex = '0 0 ' + z + 'px';
  svg.innerHTML = OB_LOGO;
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
  } else if (kind === 'trace') {                                    // Zielscanner: gepunktete Bahn mit Knick
    [[-0.55, -0.45], [-0.3, -0.1], [-0.08, 0.2], [0.12, 0.42], [0.36, 0.14], [0.56, -0.12]].forEach(function (d) { c.beginPath(); c.arc(d[0] * r, d[1] * r, r * 0.09, 0, 6.2832); c.fill(); });
  } else if (kind === 'phantom') {                                  // Geist
    c.beginPath(); c.moveTo(-r * 0.42, r * 0.5); c.lineTo(-r * 0.42, -r * 0.05); c.arc(0, -r * 0.05, r * 0.42, Math.PI, 0); c.lineTo(r * 0.42, r * 0.5);
    for (var g3 = 0; g3 < 3; g3++) c.quadraticCurveTo(r * (0.28 - g3 * 0.28), r * 0.3, r * (0.14 - g3 * 0.28), r * 0.5);
    c.closePath(); c.stroke(); c.beginPath(); c.arc(-r * 0.15, -r * 0.08, r * 0.07, 0, 6.2832); c.arc(r * 0.15, -r * 0.08, r * 0.07, 0, 6.2832); c.fill();
  } else if (kind === 'slideboost') {                               // doppelter Pfeil über einer Bahn
    c.beginPath(); c.moveTo(-r * 0.5, -r * 0.35); c.lineTo(-r * 0.1, -r * 0.05); c.lineTo(-r * 0.5, r * 0.25); c.moveTo(-r * 0.05, -r * 0.35); c.lineTo(r * 0.35, -r * 0.05); c.lineTo(-r * 0.05, r * 0.25); c.stroke();
    c.beginPath(); c.moveTo(-r * 0.6, r * 0.5); c.quadraticCurveTo(0, r * 0.35, r * 0.6, r * 0.5); c.stroke();
  } else if (kind === 'rockfall') {                                 // großer Fels
    c.beginPath(); [[-0.5, 0.1], [-0.3, -0.42], [0.15, -0.5], [0.52, -0.1], [0.4, 0.4], [-0.1, 0.52]].forEach(function (d, i) { c[i ? 'lineTo' : 'moveTo'](d[0] * r, d[1] * r); }); c.closePath(); c.stroke();
    c.beginPath(); c.arc(-r * 0.08, r * 0.02, r * 0.12, 0, 6.2832); c.fill();
  } else if (kind === 'jump') {                                     // Sprung-Bogen mit Pfeil
    c.beginPath(); c.arc(0, r * 0.25, r * 0.48, Math.PI, 0); c.stroke();
    c.beginPath(); c.moveTo(r * 0.32, r * 0.1); c.lineTo(r * 0.48, r * 0.3); c.lineTo(r * 0.64, r * 0.1); c.stroke();
  } else if (kind === 'revive') {                                   // Kreis-Pfeil
    c.beginPath(); c.arc(0, 0, r * 0.45, 0.6, 5.6); c.stroke();
    c.beginPath(); c.moveTo(r * 0.5, -r * 0.42); c.lineTo(r * 0.4, -r * 0.08); c.lineTo(r * 0.08, -r * 0.24); c.stroke();
  } else if (kind === 'frost') {                                    // Schneeflocke
    for (var f6 = 0; f6 < 3; f6++) { var fa = f6 * 1.0472; c.beginPath(); c.moveTo(Math.cos(fa) * r * 0.58, Math.sin(fa) * r * 0.58); c.lineTo(-Math.cos(fa) * r * 0.58, -Math.sin(fa) * r * 0.58); c.stroke(); }
    c.beginPath(); c.arc(0, 0, r * 0.12, 0, 6.2832); c.fill();
  } else if (kind === 'overload') {                                 // Blitz mit zwei Funken
    c.beginPath(); c.moveTo(r * 0.1, -r * 0.55); c.lineTo(-r * 0.22, r * 0.05); c.lineTo(r * 0.04, r * 0.05); c.lineTo(-r * 0.1, r * 0.55); c.lineTo(r * 0.26, -r * 0.1); c.lineTo(r * 0.0, -r * 0.1); c.closePath(); c.fill();
    c.beginPath(); c.arc(-r * 0.5, -r * 0.3, r * 0.1, 0, 6.2832); c.arc(r * 0.5, r * 0.3, r * 0.1, 0, 6.2832); c.fill();
  } else {
    c.beginPath(); c.moveTo(-r * 0.5, 0); c.lineTo(r * 0.5, 0); c.moveTo(0, -r * 0.5); c.lineTo(0, r * 0.5); c.stroke();
  }
  c.restore();
}

/* OB4 (12.10.2026): 12 selbst gezeichnete Weltraum-Szenen im EVE-Stil (keine Bilddateien, keine CCP-Grafik).
   Je Level: Szene + Farbton; Höhepunkte haben eigene Szenen. obPaintScene malt in Spielkoordinaten (W×H plus Rand m),
   liefert optional ein Dreh-Teil (spin), das beim Zeichnen langsam rotiert. */
var OB_SCENES = ['nebula', 'gasgiant', 'gate', 'belt', 'wormhole', 'sun', 'ringstation', 'wrecks', 'planet', 'galaxy', 'pillars', 'blackhole',
  'deep', 'binary', 'moon', 'shipyard', 'lava', 'ice', 'pulsar', 'comet'];   // OB2: 20 Szenen (Station + Tor neu, 8 neue Motive)
var OB_PEAK_SCENE = { 10: 'gate', 20: 'ringstation', 30: 'shipyard', 40: 'blackhole', 50: 'wormhole', 60: 'binary', 70: 'sun', 80: 'pulsar',
  90: 'nebula', 100: 'sun', 110: 'galaxy', 120: 'shipyard', 130: 'ringstation', 140: 'blackhole', 150: 'gate' };
function obSceneOf(L) {
  if (!(L >= 1)) return { kind: 'deep', hue: 215 };
  var hd = LEVELS[L - 1]; if (hd && hd.scene) return { kind: hd.scene[0], hue: hd.scene[1] };   // handgebaut: eigene Szene
  var n = OB_SCENES.length, ord = shuffle(OB_SCENES.slice(), mulberry32(0x5CE7 + Math.floor((L - 1) / n)));
  return { kind: OB_PEAK_SCENE[L] || ord[(L - 1) % n], hue: Math.round(L * 137.508) % 360 };
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
  if (kind !== 'deep') {
    obNebula(g, rnd, 120 + rnd() * 480, 180 + rnd() * 540, 260, h, kind === 'nebula' || kind === 'pillars' ? 0.5 : 0.28);
    obNebula(g, rnd, 120 + rnd() * 480, 180 + rnd() * 540, 200, h + 40 + rnd() * 160, 0.18);
  }
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
  } else if (kind === 'gate') {                                       // Sprungtor: Ring aus Segmenten mit Emittern außen, innen wirbelnde Energie
    var gr = 150;
    obSoft(g, 360, 330, 260, hsla(h + 200, 80, 55, 0.16));
    g.save(); g.translate(360, 330);
    g.lineWidth = 28; g.strokeStyle = 'rgba(16,20,28,.95)'; g.beginPath(); g.arc(0, 0, gr, 0, 6.2832); g.stroke();
    var tg = g.createLinearGradient(-gr, -gr, gr, gr); tg.addColorStop(0, 'rgba(175,190,215,.8)'); tg.addColorStop(0.5, 'rgba(72,82,100,.85)'); tg.addColorStop(1, 'rgba(28,32,42,.9)');
    g.lineWidth = 19; g.strokeStyle = tg; g.beginPath(); g.arc(0, 0, gr, 0, 6.2832); g.stroke();
    g.lineWidth = 2; g.strokeStyle = 'rgba(0,0,0,.6)';
    for (i = 0; i < 24; i++) { var ga = i * 0.2618; g.beginPath(); g.moveTo(Math.cos(ga) * (gr - 9), Math.sin(ga) * (gr - 9)); g.lineTo(Math.cos(ga) * (gr + 9), Math.sin(ga) * (gr + 9)); g.stroke(); }   // Segmentfugen
    for (i = 0; i < 8; i++) {                                         // Emitter
      g.save(); g.rotate(i * 0.7854 + 0.39);
      g.fillStyle = 'rgba(52,60,76,.95)'; g.fillRect(gr + 8, -10, 20, 20); g.fillStyle = 'rgba(105,115,135,.9)'; g.fillRect(gr + 8, -10, 20, 4);
      obSoft(g, gr - 3, 0, 15, hsla(h + 200, 100, 70, 0.75)); g.fillStyle = hsla(h + 200, 90, 88, 1); g.fillRect(gr - 5, -2, 4, 4);
      g.restore();
    }
    g.restore();
    sp = { c: obSpinCanvas(Math.round(300 * px), function (s, R) { s.scale(px, px); for (var k = 0; k < 7; k++) { s.rotate(0.9); s.strokeStyle = hsla(h + 200, 90, 70, 0.10 + k * 0.03); s.lineWidth = 3; s.beginPath(); s.arc(0, 0, 135 - k * 14, 0, 4.2); s.stroke(); } obSoft(s, 0, 0, 70, hsla(h + 200, 100, 80, 0.4)); }), x: 360, y: 330, w: 300, rot: 0.25 };
  } else if (kind === 'ringstation') {                                // Ringstation schräg von der Seite: Radring mit Fenstern, Speichen, Nabe, Andockmast
    var RA = 165, RB = 62;
    obSoft(g, 470, 250, 270, hsla(h + 180, 60, 50, 0.12));
    g.save(); g.translate(470, 250); g.rotate(-0.22);
    var half = function (back) {
      var a0 = back ? Math.PI : 0, a1 = back ? 2 * Math.PI : Math.PI;
      g.lineWidth = 20; g.strokeStyle = back ? 'rgba(36,42,54,.95)' : 'rgba(64,72,90,.97)'; g.beginPath(); g.ellipse(0, 0, RA, RB, 0, a0, a1); g.stroke();
      g.lineWidth = 3; g.strokeStyle = back ? 'rgba(110,125,150,.35)' : 'rgba(185,200,225,.6)'; g.beginPath(); g.ellipse(0, 0, RA + 9, RB + 9, 0, a0, a1); g.stroke();   // Lichtkante
      g.lineWidth = 1.5; g.strokeStyle = 'rgba(0,0,0,.55)';
      for (var w = 0; w < 18; w++) { var sa = a0 + (a1 - a0) * w / 18; g.beginPath(); g.moveTo(Math.cos(sa) * (RA - 9), Math.sin(sa) * (RB - 9)); g.lineTo(Math.cos(sa) * (RA + 9), Math.sin(sa) * (RB + 9)); g.stroke(); }
      for (w = 0; w < 54; w++) { var wa = a0 + (a1 - a0) * (w + 0.5) / 54; if (rnd() < 0.3) continue; g.fillStyle = rnd() < 0.8 ? 'rgba(255,205,120,' + (back ? 0.45 : 0.95) + ')' : 'rgba(150,210,255,.85)'; g.fillRect(Math.cos(wa) * RA - 1.5, Math.sin(wa) * RB + (back ? -3 : 2), 3, 2); }
    };
    half(true);
    g.strokeStyle = 'rgba(95,105,125,.85)'; g.lineWidth = 3;
    for (i = 0; i < 6; i++) { var sp6 = i * 1.0472 + 0.3; g.beginPath(); g.moveTo(0, -10); g.lineTo(Math.cos(sp6) * RA, Math.sin(sp6) * RB); g.stroke(); }   // Speichen
    var hb = g.createLinearGradient(-22, 0, 22, 0); hb.addColorStop(0, 'rgba(36,42,54,1)'); hb.addColorStop(0.4, 'rgba(145,158,182,1)'); hb.addColorStop(1, 'rgba(28,32,42,1)');
    g.fillStyle = 'rgba(70,78,95,1)'; g.fillRect(-4, -112, 8, 70);                                    // Andockmast
    g.fillStyle = hb; g.fillRect(-22, -46, 44, 70); g.beginPath(); g.ellipse(0, 24, 22, 8, 0, 0, 3.1416); g.fill();   // Nabe
    g.fillStyle = 'rgba(165,178,200,1)'; g.beginPath(); g.ellipse(0, -46, 22, 8, 0, 0, 6.2832); g.fill();
    for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(255,205,120,.95)'; g.fillRect(-14 + i * 7, -20, 3, 2); g.fillRect(-14 + i * 7, 0, 3, 2); }
    obSoft(g, 0, -114, 16, 'rgba(255,80,60,.8)'); g.fillStyle = '#ff6a50'; g.fillRect(-2, -116, 4, 4);   // Positionslicht
    half(false);
    g.restore();
    for (i = 0; i < 16; i++) { g.fillStyle = 'rgba(255,200,110,' + (0.3 + rnd() * 0.5) + ')'; g.fillRect(250 + rnd() * 420, 110 + rnd() * 300, 2, 1); }   // Verkehr
  } else if (kind === 'belt') {
    for (i = 0; i < 140; i++) { var tt = rnd(); x = -40 + tt * 800; y = 760 - tt * 520 + (rnd() - 0.5) * 140; obRock(g, x, y, 2 + Math.pow(rnd(), 3) * 26, rnd, hsla(h + 20, 12, 18 + rnd() * 18, 0.85)); }
    obSoft(g, 380, 520, 260, hsla(h + 30, 50, 50, 0.08));
  } else if (kind === 'wrecks') {                                   // Schlachtfeld: zerbrochene Rumpfteile (rund, keine Kreuze), glimmende Bruchkanten, Trümmer, Rauch
    for (i = 0; i < 5; i++) obSoft(g, 100 + rnd() * 520, 150 + rnd() * 650, 60 + rnd() * 80, 'rgba(30,28,32,' + (0.25 + rnd() * 0.2) + ')');
    for (i = 0; i < 6; i++) {
      x = 110 + rnd() * 500; y = 130 + rnd() * 660; var WL = 45 + rnd() * 75, wa = rnd() * 6.2832;
      for (var wd = 0; wd < 12; wd++) obRock(g, x + (rnd() - 0.5) * WL * 1.8, y + (rnd() - 0.5) * WL * 1.4, 1 + rnd() * 3, rnd, 'rgba(110,104,100,.7)');   // Trümmerwolke
      g.save(); g.translate(x, y); g.rotate(wa);
      var wgr = g.createLinearGradient(0, -WL * 0.3, 0, WL * 0.3); wgr.addColorStop(0, 'rgba(120,124,136,.9)'); wgr.addColorStop(0.45, 'rgba(56,58,66,.92)'); wgr.addColorStop(1, 'rgba(18,18,24,.92)');
      g.fillStyle = wgr; g.beginPath(); g.moveTo(-WL / 2, 0);
      g.bezierCurveTo(-WL / 2, -WL * 0.3, WL * 0.05, -WL * 0.32, WL * 0.42, -WL * 0.14);
      g.lineTo(WL * 0.34, -WL * 0.06); g.lineTo(WL * 0.47, 0); g.lineTo(WL * 0.33, WL * 0.07); g.lineTo(WL * 0.43, WL * 0.15);   // abgerissene Kante
      g.bezierCurveTo(WL * 0.05, WL * 0.32, -WL / 2, WL * 0.3, -WL / 2, 0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-WL * 0.45, -WL * 0.14); g.bezierCurveTo(-WL * 0.2, -WL * 0.26, WL * 0.1, -WL * 0.24, WL * 0.38, -WL * 0.12); g.stroke();   // Glanz
      for (var ww = 0; ww < 5; ww++) { g.fillStyle = rnd() < 0.3 ? 'rgba(255,190,110,.8)' : 'rgba(0,0,0,.45)'; g.beginPath(); g.arc(-WL * 0.36 + ww * WL * 0.13, -WL * 0.02, 1.4, 0, 6.2832); g.fill(); }   // Fenster, teils noch beleuchtet
      obSoft(g, WL * 0.42, 0, 8 + WL * 0.14, 'rgba(255,120,40,.45)'); g.fillStyle = 'rgba(255,175,90,.9)'; g.beginPath(); g.arc(WL * 0.43, 0, 1.8, 0, 6.2832); g.fill();   // Glut an der Bruchkante
      g.restore();
    }
    for (i = 0; i < 50; i++) obRock(g, rnd() * W, 120 + rnd() * 760, 1 + rnd() * 3, rnd, 'rgba(90,86,90,.65)');
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
  } else if (kind === 'deep') {                                     // tiefer Weltraum: fast schwarz, viele Sterne, kleine Farbnebel ganz in der Ferne
    g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(-m, -m, W + 2 * m, H + 2 * m);
    obStars(g, rnd, -m, -m, W + m, H + m, 1500);
    for (i = 0; i < 3; i++) {
      x = 130 + rnd() * 460; y = 120 + rnd() * 660; var dh = h + i * 110 + rnd() * 40;
      obSoft(g, x, y, 40 + rnd() * 30, hsla(dh, 80, 55, 0.2));
      for (var dk = 0; dk < 14; dk++) obSoft(g, x + (rnd() - 0.5) * 60, y + (rnd() - 0.5) * 40, 6 + rnd() * 16, hsla(dh + (rnd() - 0.5) * 40, 85, 62, 0.16));
    }
    for (i = 0; i < 2; i++) { g.save(); g.translate(130 + rnd() * 460, 150 + rnd() * 600); g.rotate(rnd() * 3); g.scale(1, 0.32); obSoft(g, 0, 0, 22, hsla(h + 40, 40, 82, 0.4)); obSoft(g, 0, 0, 5, 'rgba(255,250,235,.7)'); g.restore(); }   // ferne Galaxien
  } else if (kind === 'binary') {                                   // Doppelsonne: zwei Sterne verschiedener Farbe, Gasbrücke dazwischen
    var c1 = h + 30, c2 = h + 200, b1 = [440, 180], b2 = [530, 270];
    obSoft(g, b1[0], b1[1], 320, hsla(c1, 90, 55, 0.25)); obSoft(g, b2[0], b2[1], 240, hsla(c2, 90, 55, 0.22));
    for (i = 0; i < 40; i++) { var tq = i / 40, bw = Math.sin(tq * 3.1416); obSoft(g, b1[0] + (b2[0] - b1[0]) * tq + bw * 34, b1[1] + (b2[1] - b1[1]) * tq - bw * 18, 9 + bw * 12, hsla(c1 + (c2 - c1) * tq, 90, 66, 0.13)); }
    [[b1, c1, 11], [b2, c2, 7]].forEach(function (q) { obSoft(g, q[0][0], q[0][1], q[2] * 6, hsla(q[1], 100, 65, 0.45)); obSoft(g, q[0][0], q[0][1], q[2] * 1.8, 'rgba(255,250,240,.8)'); g.fillStyle = 'rgba(255,253,245,1)'; g.beginPath(); g.arc(q[0][0], q[0][1], q[2], 0, 6.2832); g.fill(); });
  } else if (kind === 'moon') {                                     // großer Planet unten links, Mond oben rechts
    obPlanet(g, 110, 830, 270, h, rnd, false);
    obPlanet(g, 520, 230, 46, h + 160, rnd, false);
    g.save(); g.beginPath(); g.arc(520, 230, 46, 0, 6.2832); g.clip();
    for (i = 0; i < 14; i++) { x = 490 + rnd() * 60; y = 200 + rnd() * 60; var cr = 2 + rnd() * 6; g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.arc(x, y, cr, 0, 6.2832); g.fill(); g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x, y, cr, 3.6, 5.5); g.stroke(); }
    g.restore();
  } else if (kind === 'shipyard') {                                 // Werft: geschwungener Schiffsrumpf in runden Haltereifen, vorn noch offene Spanten, weiche Arbeitslichter
    obSoft(g, 400, 260, 260, hsla(h + 190, 60, 50, 0.12));
    g.save(); g.translate(400, 260); g.rotate(-0.38);
    var hoops = [-130, -60, 10, 80, 150], hoop = function (x, back) {   // Haltereifen als schräge Ellipse: hintere Hälfte vor dem Rumpf zeichnen, vordere danach
      g.lineWidth = 5; g.strokeStyle = back ? 'rgba(70,78,96,.85)' : 'rgba(150,162,185,.9)';
      g.beginPath(); g.ellipse(x, 0, 16, 78, 0, back ? Math.PI / 2 : -Math.PI / 2, back ? 3 * Math.PI / 2 : Math.PI / 2); g.stroke();
      if (!back) { obSoft(g, x + 10, -66, 9, 'rgba(255,225,160,.75)'); obSoft(g, x + 10, 66, 9, 'rgba(255,225,160,.75)'); }
    };
    hoops.forEach(function (x) { hoop(x, true); });
    g.lineWidth = 2.5; g.strokeStyle = 'rgba(110,120,140,.7)';          // Halteschienen oben und unten (leicht gebogen)
    g.beginPath(); g.moveTo(-150, -76); g.quadraticCurveTo(10, -88, 170, -76); g.moveTo(-150, 76); g.quadraticCurveTo(10, 88, 170, 76); g.stroke();
    var hull = function () { g.beginPath(); g.moveTo(-200, -6); g.bezierCurveTo(-200, -40, -150, -48, -60, -46); g.bezierCurveTo(20, -44, 70, -34, 95, -26); g.lineTo(95, 26); g.bezierCurveTo(70, 34, 20, 44, -60, 46); g.bezierCurveTo(-150, 48, -200, 40, -200, 6); g.closePath(); };
    var hg = g.createLinearGradient(0, -48, 0, 48); hg.addColorStop(0, 'rgba(170,182,205,.97)'); hg.addColorStop(0.3, 'rgba(95,105,125,.98)'); hg.addColorStop(0.75, 'rgba(40,45,58,.98)'); hg.addColorStop(1, 'rgba(20,23,30,.98)');
    hull(); g.fillStyle = hg; g.fill();
    g.save(); hull(); g.clip();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; for (i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-180 + i * 32, 0, 6, 50, 0, -Math.PI / 2, Math.PI / 2); g.stroke(); }   // Plattenfugen, der Rundung folgend
    g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-190, -30); g.bezierCurveTo(-120, -42, 20, -38, 90, -22); g.stroke();   // Glanzlinie
    g.restore();
    for (i = 0; i < 18; i++) { var wxp = -175 + i * 15, wyp = -10 + Math.pow((wxp + 40) / 140, 2) * 6; g.fillStyle = 'rgba(255,208,135,.9)'; g.beginPath(); g.arc(wxp, wyp, 1.3, 0, 6.2832); g.fill(); }   // Fensterreihe
    g.strokeStyle = 'rgba(150,160,182,.75)'; g.lineWidth = 1.8;          // offener Bug: runde Spanten
    for (i = 0; i < 5; i++) { var bx = 108 + i * 17, bh = 26 - i * 4.6; g.beginPath(); g.ellipse(bx, 0, 5, bh, 0, 0, 6.2832); g.stroke(); }
    g.beginPath(); g.moveTo(95, -26); g.quadraticCurveTo(150, -18, 185, 0); g.quadraticCurveTo(150, 18, 95, 26); g.stroke();
    obSoft(g, -205, -16, 24, hsla(h + 200, 90, 72, 0.7)); obSoft(g, -205, 16, 24, hsla(h + 200, 90, 72, 0.7));   // Triebwerke
    for (i = 0; i < 4; i++) { var spx = 110 + rnd() * 60, spy = (rnd() - 0.5) * 30; obSoft(g, spx, spy, 11, 'rgba(170,220,255,.85)'); g.fillStyle = '#fff'; g.beginPath(); g.arc(spx, spy, 1.2, 0, 6.2832); g.fill(); }   // Schweißfunken
    hoops.forEach(function (x) { hoop(x, false); });
    g.restore();
  } else if (kind === 'lava') {                                     // Lavawelt: dunkle Kruste mit glühenden Rissen
    var lx = 560, ly = 690, lr = 210;
    obSoft(g, lx, ly, lr * 1.35, 'rgba(255,90,20,.14)');
    obPlanet(g, lx, ly, lr, 12, rnd, false);
    g.save(); g.beginPath(); g.arc(lx, ly, lr, 0, 6.2832); g.clip();
    g.fillStyle = 'rgba(12,6,4,.55)'; g.fillRect(lx - lr, ly - lr, 2 * lr, 2 * lr);
    g.strokeStyle = 'rgba(255,130,35,.8)'; g.shadowColor = '#ff6a10'; g.shadowBlur = 8; g.lineWidth = 1.6;
    for (i = 0; i < 28; i++) { x = lx + (rnd() - 0.5) * 2 * lr; y = ly + (rnd() - 0.5) * 2 * lr; g.beginPath(); g.moveTo(x, y); for (var ls = 0; ls < 6; ls++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
    g.shadowBlur = 0;
    var lsh = g.createLinearGradient(lx - lr, ly - lr, lx + lr, ly + lr); lsh.addColorStop(0.35, 'rgba(0,0,0,0)'); lsh.addColorStop(1, 'rgba(0,0,0,.8)'); g.fillStyle = lsh; g.fillRect(lx - lr, ly - lr, 2 * lr, 2 * lr);
    g.restore();
  } else if (kind === 'ice') {                                      // Eiswelt mit Ring und Rissen
    obSoft(g, 210, 300, 190, 'rgba(160,220,255,.09)');
    obPlanet(g, 210, 300, 120, 195, rnd, true);
    g.save(); g.beginPath(); g.arc(210, 300, 120, 0, 6.2832); g.clip(); g.strokeStyle = 'rgba(235,250,255,.35)'; g.lineWidth = 1;
    for (i = 0; i < 18; i++) { x = 90 + rnd() * 240; y = 180 + rnd() * 240; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 120, y + (rnd() - 0.5) * 40); g.stroke(); }
    g.restore();
  } else if (kind === 'pulsar') {                                   // Pulsar: heller Kern, zwei drehende Strahlenkegel
    obSoft(g, 360, 380, 220, hsla(h + 200, 90, 60, 0.18));
    sp = { c: obSpinCanvas(Math.round(700 * px), function (s) {
      s.scale(px, px);
      [0, Math.PI].forEach(function (a) { s.save(); s.rotate(a); var pb = s.createLinearGradient(0, 0, 330, 0); pb.addColorStop(0, hsla(h + 200, 100, 85, 0.4)); pb.addColorStop(1, 'rgba(0,0,0,0)'); s.fillStyle = pb; s.beginPath(); s.moveTo(0, 0); s.lineTo(330, -40); s.lineTo(330, 40); s.closePath(); s.fill(); s.restore(); });
      obSoft(s, 0, 0, 42, 'rgba(240,250,255,.95)');
    }), x: 360, y: 380, w: 700, rot: 0.5 };
  } else if (kind === 'comet') {                                    // Komet: heller Kopf, Staubschweif und farbiger Ionenschweif
    g.save(); g.translate(540, 210); g.rotate(2.35);
    var ct = g.createLinearGradient(0, 0, 620, 0); ct.addColorStop(0, 'rgba(255,240,210,.55)'); ct.addColorStop(1, 'rgba(255,200,150,0)');
    g.fillStyle = ct; g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(300, -20, 620, -110); g.lineTo(620, 60); g.quadraticCurveTo(300, 30, 0, 6); g.closePath(); g.fill();
    var it = g.createLinearGradient(0, 0, 700, 0); it.addColorStop(0, hsla(h + 200, 100, 75, 0.5)); it.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = it; g.beginPath(); g.moveTo(0, -3); g.lineTo(700, -26); g.lineTo(700, -10); g.lineTo(0, 3); g.closePath(); g.fill();
    g.restore();
    obSoft(g, 540, 210, 42, 'rgba(255,250,235,.8)'); obSoft(g, 540, 210, 10, 'rgba(255,255,255,1)');
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
  var vibeOn = false; try { vibeOn = store.getItem(VIBE_KEY) === '1'; } catch (e) { }
  var vibeBox = el('label', 'ob-bga'), vibeIn = el('input'); vibeIn.type = 'checkbox'; vibeIn.checked = vibeOn; vibeBox.title = obT('Vibration bei Combo und Gleiter (Handy)');
  vibeBox.appendChild(vibeIn); vibeBox.appendChild(el('span', null, 'Vibration'));
  vibeIn.addEventListener('change', function () { vibeOn = vibeIn.checked; try { store.setItem(VIBE_KEY, vibeOn ? '1' : '0'); } catch (e) { } buzz(30); });
  if (!(win.navigator && win.navigator.vibrate)) vibeBox.style.display = 'none';   // nur, wo das Gerät vibrieren kann
  function buzz(ms) { if (vibeOn && !calmV && win.navigator && win.navigator.vibrate) { try { win.navigator.vibrate(ms); } catch (e) { } } }
  var calmV = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
  bar.appendChild(btnContinue); bar.appendChild(btnNew); bar.appendChild(btnRestart); bar.appendChild(lvBox); bar.appendChild(btnPause); bar.appendChild(btnSound); bar.appendChild(volBox); bar.appendChild(vibeBox); bar.appendChild(bgBox); bar.appendChild(hint);
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
    // Charakterwahl: online.chars() liefert [{cid, n}] aller eingeloggten Charaktere (optional); ohne Wahl gilt online.me() (aktiver Charakter)
    var wwPick = el('select', 'ob-ww-pick'); wwPick.setAttribute('aria-label', obT('Charakter für die Bestenliste'));
    var wwChars = function () { try { return (online.chars && online.chars()) || []; } catch (e) { return []; } };
    var wwFill = function () {
      var list = wwChars(), sel = null; try { sel = store.getItem(ONLINE_CHAR_KEY); } catch (e) { }
      wwPick.textContent = ''; list.forEach(function (c) { var o = el('option'); o.value = String(c.cid); o.textContent = c.n; wwPick.appendChild(o); });
      var me = wwMe(); if (me) wwPick.value = String(me.cid);
      wwPick.style.display = list.length > 1 ? '' : 'none';
    };
    wwPick.addEventListener('change', function () { try { store.setItem(ONLINE_CHAR_KEY, wwPick.value); } catch (e) { } wwWhoTxt(); });
    var wwWhoTxt = function () { var me = wwMe(); wwWho.textContent = me ? tt('Name: ', 'Name: ') + me.n : obT('Kein EVE-Charakter eingeloggt – Hochladen geht erst nach dem Login.'); };
    side.insertBefore(wwPick, wwWho.nextSibling);
    wwFill(); wwWhoTxt();
    wwChk.addEventListener('change', function () { wwOn = wwChk.checked; try { store.setItem(ONLINE_KEY, wwOn ? '1' : '0'); } catch (e) { } wwWhoTxt(); });
    wwBtn.addEventListener('click', function () { wwShow(Number(wwSel.value)); });
  }
  function wwMe() {                                                // gewählter Charakter, sonst der aktive
    if (!online) return null;
    var sel = null; try { sel = store.getItem(ONLINE_CHAR_KEY); } catch (e) { }
    var list = []; try { list = (online.chars && online.chars()) || []; } catch (e) { }
    for (var i = 0; i < list.length; i++) if (String(list[i].cid) === sel) return { cid: String(list[i].cid), n: String(list[i].n) };
    return online.me();
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
    var me = wwMe(); if (!me) return;
    e.cid = me.cid; e.n = me.n;
    online.send(e).then(function (r) { if (r && r.rank && wwSt) wwSt.textContent = tt('Weltweit: Platz ', 'Worldwide: rank ') + r.rank + (e.l ? ' · Level ' + e.l : tt(' · Kampagne', ' · campaign')); }, function () { });
  }
  var hLegend = el('h3', null, 'Erze & Hindernisse'); hLegend.style.marginTop = '14px'; side.appendChild(hLegend);
  var legend = el('ul', 'ob-legend'); side.appendChild(legend);
  var hPow = el('h3', null, 'Power-Items'); side.appendChild(hPow);
  var legendP = el('ul', 'ob-legend'); side.appendChild(legendP);
  side.appendChild(el('h3', null, 'Regeln'));
  side.appendChild(el('p', 'ob-rules', OB_EN ? 'Campaign: ' + LEVELS.length + ' levels, the points add up. You get 10 drones per level. Clear all ore veins (orange) = level done. Every 6 hits with one drone raise the factor by 1 (up to x8). The first drone that lands in the freighter gives you a drone and 250 points. After a win every drone left is worth 1,000 points. Power-ups act on the drone that hits them; new ones join in higher levels. Wrecks cannot be destroyed, warp gates send the drone to the partner gate. Armored rocks need several hits. Gravity fields pull the drone in, repulsors push it away. Combo: from 5 hits with one drone you get a combo bonus at the end of the shot (10 hits = 600, 20 = 3,200, 30 = 7,800 points). Your progress is saved after every level so you can continue later. Slides: roll over 6 or more stones of a rail in a row for a slide bonus (12 stones = 1,680, from 12 an extreme slide pays double). Skill shots give a small bonus: long shot, ore rush, bank shot, freighter kick.' : 'Kampagne: ' + LEVELS.length + ' Level, die Punkte zählen zusammen. Pro Level hast du 10 Drohnen. Alle Erzadern (orange) leeren = Level geschafft. Alle 6 Treffer mit einer Drohne steigt der Faktor um 1 (höchstens x8). Die erste Drohne, die im Frachter landet, gibt eine Drohne und 250 Punkte. Nach dem Sieg zählt jede übrige Drohne 1.000 Punkte. Power-Items wirken auf die Drohne, die sie trifft. Wracks sind nicht zerstörbar, Warp-Tore bringen die Drohne ans Partner-Tor. Panzer-Brocken brauchen mehrere Treffer. Gravitationsfelder ziehen die Drohne an, Abstoßer stoßen sie weg. Combo: ab 5 Treffern mit einer Drohne gibt es am Schussende einen Combo-Bonus (10 Treffer = 600, 20 = 3.200, 30 = 7.800 Punkte). Dein Stand wird nach jedem Level gespeichert, du kannst später weiterspielen. Gleiter: Rollt die Drohne über 6 oder mehr Steine einer Bahn hintereinander, gibt es einen Gleiter-Bonus (12 Steine = 1.680, ab 12 zählt der Extreme Gleiter doppelt). Geschicklichkeitsschüsse geben einen kleinen Bonus: Langer Schuss, Erz-Ansturm, Querbande, Frachter-Tritt.'));
  rootEl.appendChild(main); rootEl.appendChild(side);
  container.appendChild(rootEl);

  var ctx = canvas.getContext('2d');
  var scale = 1, dpr = 1, bg = null, bgLevel = -1, paused = false, destroyed = false, raf = 0, last = 0;
  var texts = [], parts = [], rings = [], bolts = [], hbeams = [], newRank = 0, entered = false, flash = 0, laserT = 0, catchT = 0, beamPts = null, bannerT = 0, bumpT = {};
  var fxSlow = 0, fxZx = 0, fxZy = 0, banner2 = null;                 // OB2 1b: Zeitlupe + Zoom beim letzten Ziel, großes Banner (Gleiter, Geschick)
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
  /* Steinbahn-Stein: längliche Erzplatte in genau den Farben und mit dem Leuchten der Brocken (COL/PCOL wie drawPegOn).
     part: 'aura' = nur das pulsierende Erz-Leuchten (volle Stärke), 'body' = nur die Platte, sonst beides (Legende) */
  function drawStoneOn(c, p, t, part) {
    var col = p.t === 'g' ? PCOL[p.power || 'bomb'] : COL[p.t] || COL.n, hl = (p.dl || 20) / 2, r = p.r, on = p.lit && !p.used, id = p.id || 0, i;
    c.save(); c.translate(p.x, p.y); c.rotate(p.a || 0);
    function plate(e) { var x = -hl - r + e, y = -r + e, w = 2 * (hl + r - e), hh = 2 * (r - e), rr = r - e; c.beginPath(); c.moveTo(x + rr, y); c.lineTo(x + w - rr, y); c.arcTo(x + w, y, x + w, y + rr, rr); c.arcTo(x + w, y + hh, x + w - rr, y + hh, rr); c.lineTo(x + rr, y + hh); c.arcTo(x, y + hh, x, y + hh - rr, rr); c.arcTo(x, y, x + rr, y, rr); c.closePath(); }
    if (p.t !== 'n' && !p.lit && part !== 'body') {                  // Erz-Leuchten wie bei den Brocken (pulsiert)
      var og = c.createLinearGradient(0, -2.2 * r, 0, 2.2 * r); og.addColorStop(0, 'rgba(0,0,0,0)'); og.addColorStop(0.5, col.glow); og.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = part === 'aura' ? 1 : 0.16 + 0.12 * (0.5 + 0.5 * Math.sin((t || 0) * 3 + id)); c.fillStyle = og; c.shadowColor = col.glow; c.shadowBlur = 12;
      c.fillRect(-hl - r, -2.2 * r, 2 * (hl + r), 4.4 * r); c.shadowBlur = 0; c.globalAlpha = 1;
    }
    if (part === 'aura') { c.restore(); return; }
    if (p.used) c.globalAlpha = 0.22;                                // abgebaut: nur noch als Schatten, durchlässig
    var gr = c.createLinearGradient(-hl * 0.4, -r, hl * 0.3, r);
    if (on) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, col.hi); gr.addColorStop(1, col.glow); c.shadowColor = col.glow; c.shadowBlur = 26; }
    else { gr.addColorStop(0, col.hi); gr.addColorStop(0.45, col.base); gr.addColorStop(1, '#0c0f14'); if (p.t !== 'n' && !p.used) { c.shadowColor = col.glow; c.shadowBlur = 10; } }
    plate(0); c.fillStyle = gr; c.fill(); c.shadowBlur = 0;
    if (!p.lit) {
      c.save(); plate(0); c.clip();
      if (p.t === 'z' || p.t === 'b') {                              // Erzkristalle wie auf den Brocken
        for (i = 0; i < 2; i++) {
          var kx = (i ? 0.45 : -0.4) * hl, ks = r * 0.42;
          c.save(); c.translate(kx, 0); c.rotate(0.6 + i);
          c.fillStyle = col.glow; c.shadowColor = col.glow; c.shadowBlur = 8;
          c.beginPath(); c.moveTo(0, -ks * 1.4); c.lineTo(ks * 0.7, 0); c.lineTo(0, ks * 1.4); c.lineTo(-ks * 0.7, 0); c.closePath(); c.fill(); c.shadowBlur = 0;
          c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(0, -ks * 1.4); c.lineTo(ks * 0.7, 0); c.lineTo(0, -ks * 0.1); c.closePath(); c.fill();
          c.restore();
        }
      } else if (p.t === 'n') {
        c.fillStyle = 'rgba(0,0,0,.30)'; c.beginPath(); c.arc(-hl * 0.35, r * 0.1, r * 0.35, 0, 6.2832); c.fill();   // Krater
        c.fillStyle = 'rgba(255,255,255,.18)'; for (i = 0; i < 4; i++) c.fillRect((hash(id, i + 60) - 0.5) * hl * 1.6, (hash(id, i + 70) - 0.5) * r * 1.2, 1.4, 1.4);
      }
      c.restore();
    }
    c.lineWidth = 1; c.strokeStyle = on ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.5)'; plate(0.5); c.stroke();
    if (p.t === 'g' && !p.used) { c.save(); c.rotate(-(p.a || 0)); c.scale(0.6, 0.6); drawPowerIcon(c, p.power || 'bomb', 10); c.restore(); }
    c.restore();
  }
  /* Zwischenbilder je Steinart und Zustand (kein teures Leuchten je Bild); auf dem Handy ohne pulsierendes Erz-Leuchten */
  var stoneCache = {}, lite = !!(opts.lite || (win.matchMedia && win.matchMedia('(pointer: coarse)').matches));
  function stoneSprite(p, part) {
    var key = part + p.t + (p.power || '') + (p.used ? 'u' : p.lit ? 'l' : 'i') + Math.round(p.dl || 20), sp = stoneCache[key];
    if (sp) return sp;
    var pad = 18, w = (p.dl || 20) + 2 * p.r + 2 * pad, h = 4.4 * p.r + 2 * pad, cv = document.createElement('canvas');
    cv.width = Math.ceil(w * scale); cv.height = Math.ceil(h * scale);
    var g = cv.getContext('2d'); g.scale(scale, scale);
    drawStoneOn(g, { t: p.t, power: p.power, lit: p.lit, used: p.used, r: p.r, dl: p.dl, x: w / 2, y: h / 2, a: 0, id: 0 }, 0, part);
    return (stoneCache[key] = { c: cv, w: w, h: h });
  }
  /* Phase 7: Brocken als Zwischenbild je Brocken und Zustand (Form, Drehung, Panzer, getroffen); das Erz-Leuchten pulsiert als eigenes Bild darüber */
  var pegCache = {}, auraCache = {};
  function drawPegFast(p, t) {
    if (p.t === 'g' || p.t === 'w' || p.st) { drawPegOn(ctx, p, t); return; }   // Items (drehende Ringe) und Wracks (Blinklicht) weiter live
    var key = p.id + p.t + (p.lit ? 'l' : '') + (p.hp || 0), sp = pegCache[key], R = p.r * 1.5 + 4;
    if (!sp) {
      var cv = document.createElement('canvas'); cv.width = cv.height = Math.ceil(2 * R * scale);
      var g = cv.getContext('2d'); g.scale(scale, scale);
      drawPegOn(g, Object.assign({}, p, { x: R, y: R }), 0, true);
      sp = pegCache[key] = cv;
    }
    if (p.t !== 'n' && !p.lit && !lite) {
      var ak = p.t + Math.round(p.r), au = auraCache[ak];
      if (!au) { au = document.createElement('canvas'); au.width = au.height = Math.ceil(4 * p.r * scale); var ag = au.getContext('2d'); ag.scale(scale, scale); var og = ag.createRadialGradient(2 * p.r, 2 * p.r, p.r * 0.6, 2 * p.r, 2 * p.r, p.r * 2); og.addColorStop(0, COL[p.t].glow); og.addColorStop(1, 'rgba(0,0,0,0)'); ag.fillStyle = og; ag.fillRect(0, 0, 4 * p.r, 4 * p.r); auraCache[ak] = au; }
      var ga = ctx.globalAlpha; ctx.globalAlpha = ga * (0.16 + 0.12 * (0.5 + 0.5 * Math.sin(t * 3 + (p.id || 0)))); ctx.drawImage(au, p.x - 2 * p.r, p.y - 2 * p.r, 4 * p.r, 4 * p.r); ctx.globalAlpha = ga;
    }
    ctx.drawImage(sp, p.x - R, p.y - R, 2 * R, 2 * R);
  }
  function drawStone(p, t) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a || 0);
    var brg = game.stoneRails && game.stoneRails[p.rg];
    if (brg && brg.belt) { var bo = ((t * brg.belt) % 14 + 14) % 14 - 7; ctx.strokeStyle = 'rgba(120,230,255,.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bo - 3, -p.r - 5); ctx.lineTo(bo + 1, -p.r - 2); ctx.lineTo(bo - 3, -p.r + 1); ctx.stroke(); }   // Förderband-Pfeile
    if (p.t !== 'n' && !p.lit && !lite) { var au = stoneSprite(p, 'aura'); ctx.globalAlpha = 0.16 + 0.12 * (0.5 + 0.5 * Math.sin(t * 3 + p.id)); ctx.drawImage(au.c, -au.w / 2, -au.h / 2, au.w, au.h); ctx.globalAlpha = 1; }
    var sp = stoneSprite(p, 'body'); ctx.drawImage(sp.c, -sp.w / 2, -sp.h / 2, sp.w, sp.h);
    ctx.restore();
  }
  function drawPegOn(c, p, t, noAura) {
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
    if (p.t !== 'n' && !p.lit && !noAura) {                        // Erz-Leuchten (pulsiert)
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
  legendRow(legend, function (c) { [[-7, 'n'], [7, 'z']].forEach(function (s, i) { drawStoneOn(c, fakePeg(s[1], { st: 1, x: s[0], y: 2 - i * 4, r: 4.5, a: -0.28, dl: 9, id: i }), 0); }); },
    tt('Steinbahn: die Drohne rollt darauf, jeder berührte Stein leuchtet und gibt Punkte wie ein Brocken – abgebaute Steine lassen die Drohne durch, manche Bahnen drehen oder bewegen sich',
       'Stone rail: the drone rolls along it, every stone it touches lights up and scores like a rock – cleared stones let the drone pass, some rails spin or move'));
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
  /* Hintergrund (bewegt sich ganz leicht = Parallaxe) und fester Rahmen (Gitter, Vignette) getrennt vorgezeichnet. OB2: ohne Eck-Markierungen und Seiten-Schienen */
  /* OB2 2b: Weltraum-Bild je Level (Datei neben dem Spiel); fehlt es oder lädt es nicht, bleibt der dunkle Verlauf */
  var BGM = 24, frame = null, bgImg = null, bgUrl = null, bgSpin = null;
  function setBg(url) {
    if (url === bgUrl) return; bgUrl = url; bgImg = null; bgLevel = -1;
    if (!url) return;
    var im = new win.Image();
    im.onload = function () { if (bgUrl === url) { bgImg = im; bgLevel = -1; } };
    im.src = url;
  }
  function renderBg() {
    pegCache = {};                                                    // neues Level: Brocken-Ids gelten neu
    var cw = canvas.width, ch = canvas.height, k = cw / W, sc = obSceneOf(game.level), hue = sc.hue, rnd = mulberry32(900 + game.level * 31);
    bgLevel = game.level;
    bg = document.createElement('canvas'); bg.width = Math.round((W + 2 * BGM) * k); bg.height = Math.round((H + 2 * BGM) * k);
    var g = bg.getContext('2d'); g.setTransform(k, 0, 0, k, BGM * k, BGM * k);
    // OB2: die Szenen aus OmniBreaker 1 sind für 720 × 900 gemalt – gleichmäßig auf die Feldhöhe vergrößert (seitlich etwas abgeschnitten)
    var ss = H / 900, sx = function (x) { return W / 2 + (x - 360) * ss; }, sy = function (y) { return H / 2 + (y - 450) * ss; };
    g.save(); g.translate(W / 2, H / 2); g.scale(ss, ss); g.translate(-360, -450);
    var sp = obPaintScene(g, sc.kind, hue, rnd, 720, 900, BGM / ss + 160, k * ss);
    g.restore();
    bgSpin = sp ? { c: sp.c, x: sx(sp.x), y: sy(sp.y), w: sp.w * ss, rot: sp.rot, over: sp.over && function (c) { c.save(); c.translate(W / 2, H / 2); c.scale(ss, ss); c.translate(-360, -450); sp.over(c); c.restore(); } } : null;
    if (opts.bgVivid !== false && 'filter' in g) {                   // OB2: Szenen kräftiger (Nutzer: „zu blass“) – einmal beim Aufbau, nicht je Bild
      var bv = document.createElement('canvas'); bv.width = bg.width; bv.height = bg.height;
      var gv = bv.getContext('2d'); gv.filter = 'saturate(1.3) contrast(1.1) brightness(1.08)'; gv.drawImage(bg, 0, 0); bg = bv;
      g = bg.getContext('2d'); g.setTransform(k, 0, 0, k, BGM * k, BGM * k);
      if (bgSpin) { var sv = document.createElement('canvas'); sv.width = bgSpin.c.width; sv.height = bgSpin.c.height; var gs = sv.getContext('2d'); gs.filter = 'saturate(1.3) brightness(1.08)'; gs.drawImage(bgSpin.c, 0, 0); bgSpin.c = sv; }
    }
    if (bgImg) { var ik = Math.max((W + 2 * BGM) / bgImg.width, (H + 2 * BGM) / bgImg.height), iw = bgImg.width * ik, ih = bgImg.height * ik; g.drawImage(bgImg, W / 2 - iw / 2, H / 2 - ih / 2, iw, ih); }
    frame = document.createElement('canvas'); frame.width = cw; frame.height = ch;
    g = frame.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0);
    g.strokeStyle = hsla(hue, 70, 75, 0.045); g.lineWidth = 1;
    for (var x = 0; x <= W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (var y = 0; y <= H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    var vg = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);                                                  // Vignette
  }
  function drawBg(t) {
    var dx = Math.sin(t * 0.05) * BGM * 0.7, dy = Math.cos(t * 0.037) * BGM * 0.55;
    ctx.drawImage(bg, -BGM + dx, -BGM + dy, W + 2 * BGM, H + 2 * BGM);
    if (bgSpin && !bgImg) {
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
    scale = cw / W; stoneCache = {}; pegCache = {}; auraCache = {};
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
    var tr = b.trail || [], i, sl = Math.min(1, (b.slideN || 0) / 12), gold = (b.slideN || 0) >= 6, hot = b.pierce > 0, col = gold ? '#ffd36a' : hot ? '#ffb347' : '#4cc3ff', col2 = gold ? '255,211,106' : hot ? '255,150,40' : '76,195,255';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (i = 1; i < tr.length; i++) {                                  // Schweif als leuchtendes Band (beim Gleiten breiter und golden)
      var f = i / tr.length;
      ctx.globalAlpha = f * (0.55 + 0.3 * sl); ctx.strokeStyle = col; ctx.lineWidth = (1 + 9 * f) * (1 + 1.2 * sl); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tr[i - 1].x, tr[i - 1].y); ctx.lineTo(tr[i].x, tr[i].y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    var bl = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r * 3.6); bl.addColorStop(0, 'rgba(' + col2 + ',.55)'); bl.addColorStop(1, 'rgba(' + col2 + ',0)');
    ctx.fillStyle = bl; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 3.6, 0, 6.2832); ctx.fill();
    ctx.restore();
    if (b.rock) {                                                     // Felsbrecher: großer Fels
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.t * 4);
      var rk = ctx.createRadialGradient(-b.r * 0.4, -b.r * 0.4, 1, 0, 0, b.r * 1.1); rk.addColorStop(0, '#efdcc4'); rk.addColorStop(0.5, '#8a7258'); rk.addColorStop(1, '#2a2018');
      ctx.fillStyle = rk; ctx.shadowColor = '#d0a070'; ctx.shadowBlur = 18; ctx.beginPath();
      for (i = 0; i < 9; i++) { var ra = i / 9 * 6.2832, rr0 = b.r * (0.85 + 0.15 * Math.sin(i * 2.3)); ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ra) * rr0, Math.sin(ra) * rr0); }
      ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(b.r * 0.25, b.r * 0.1, b.r * 0.25, 0, 6.2832); ctx.fill(); ctx.restore();
      return;
    }
    var gr = ctx.createRadialGradient(b.x - 2.5, b.y - 2.5, 1, b.x, b.y, b.r + 2);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, hot ? '#ffc070' : b.phantomT > 0 ? '#e8eaff' : '#9fe0ff'); gr.addColorStop(1, hot ? '#e86a10' : b.phantomT > 0 ? '#6a70c0' : '#1f8fe0');
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
    var zf = fxSlow > 0 && !calm ? 1 + 0.12 * Math.sin(Math.PI * Math.min(1, fxSlow / 1.1)) : 1;   // OB2 1b: kurzer Zoom aufs letzte Ziel
    ctx.setTransform(scale * zf, 0, 0, scale * zf, (1 - zf) * fxZx * scale + (sk ? (Math.random() * 2 - 1) * sk * scale : 0), (1 - zf) * fxZy * scale + (sk ? (Math.random() * 2 - 1) * sk * scale : 0));
    ctx.clearRect(0, 0, W, H);
    var ba = bgA / 100;
    ctx.globalAlpha = ba; if (ba > 0) drawBg(t);
    var i;
    for (i = 0; i < stars.length && ba > 0; i++) {
      var s = stars[i], tw = (0.3 + 0.35 * Math.sin(t * s.ph + i)) * ba; ctx.globalAlpha = tw;
      ctx.fillStyle = s.c; ctx.fillRect(s.x, s.y, s.r, s.r);
      if (s.big) { ctx.globalAlpha = tw * 0.6; ctx.fillRect(s.x - 5, s.y + s.r / 2 - 0.4, 11 + s.r, 0.8); ctx.fillRect(s.x + s.r / 2 - 0.4, s.y - 5, 0.8, 11 + s.r); }
    }
    ctx.globalAlpha = ba; ctx.drawImage(frame, 0, 0, W, H); ctx.globalAlpha = 1;                                  // OB4: Gitter und Vignette bleiben fest
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
    for (i = 0; i < game.pegs.length; i++) {
      var gp = game.pegs[i]; if (gp.gone) continue;
      if (gp.st) drawStone(gp, t);
      else if (gp.fade) { var fv = Math.sin(gp.fade.w * game.mt + gp.fade.p); ctx.globalAlpha = fv < 0 ? 0.12 : Math.min(1, 0.35 + fv); drawPegFast(gp, t); ctx.globalAlpha = 1; }   // Geisterbrocken
      else if (gp.ghost) { ctx.globalAlpha = gp.lit ? 0.7 : 0.32 + 0.1 * Math.sin(t * 5 + i); drawPegFast(gp, t); ctx.globalAlpha = 1; }   // Geisterbrocken
      else drawPegFast(gp, t);
    }
    if (game.status === 'flying' && game.targetsLeft === 0 && game.targetsTotal > 0) {   // „Fieber“: alle Erzadern weg – Frachter hervorheben
      var fb = game.bucket, fp = 0.5 + 0.5 * Math.sin(t * 8);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 + 0.25 * fp; ctx.fillStyle = rainbow(fb.x, 260, t); ctx.fillRect(fb.x - 130, fb.y - 40, 260, 70); ctx.restore();
      ctx.textAlign = 'center'; ctx.font = '800 18px "Segoe UI",sans-serif'; ctx.fillStyle = rainbow(fb.x, 200, t); ctx.fillText('CATCH BONUS +' + CFG.catchPts, fb.x, fb.y - 50);
    }
    if (game.status === 'aiming' && game.traceShots > 0) {             // Zielscanner: Leuchtspur nach dem ersten Abprall
      var pl = game.predictLong();
      if (pl.first > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = PCOL.trace.glow; ctx.shadowColor = PCOL.trace.glow; ctx.shadowBlur = lite ? 0 : 10; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(pl.pts[pl.first].x, pl.pts[pl.first].y);
        for (i = pl.first + 1; i < pl.pts.length; i++) { ctx.globalAlpha = 1; ctx.lineTo(pl.pts[i].x, pl.pts[i].y); }
        ctx.globalAlpha = 0.75; ctx.stroke(); ctx.restore();
      }
    }
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
    if (game.traceShots > 0) { ctx.fillStyle = PCOL.trace.glow; ctx.font = '700 12px "Segoe UI",sans-serif'; ctx.textAlign = 'left'; ctx.fillText(tt('ZIELSCANNER ×', 'SCANNER ×') + game.traceShots, 20, 44 + (game.volley ? 18 : 0) + (game.net > 0 ? 18 : 0)); }
    var sn = 0; game.balls.forEach(function (b) { sn = Math.max(sn, b.slideN || 0); });
    if (sn >= 2) {                                                      // Gleiter-Zähler am rechten Rand
      ctx.textAlign = 'right'; ctx.font = '800 ' + (sn >= 12 ? 24 : sn >= 6 ? 20 : 15) + 'px "Segoe UI",sans-serif';
      ctx.fillStyle = sn >= 12 ? rainbow(W - 70, 120, t) : sn >= 6 ? '#ffd36a' : 'rgba(220,230,245,.8)'; ctx.fillText('SLIDE ' + sn, W - 14, H - 90);
    }
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
    if (banner2 && banner2.life > 0) {
      var ba2 = Math.min(1, banner2.life / 0.4, (banner2.max - banner2.life) / 0.12 + 0.01), bz = 1 + 0.35 * Math.max(0, 1 - (banner2.max - banner2.life) / 0.2);
      ctx.globalAlpha = ba2; ctx.textAlign = 'center'; ctx.font = '900 ' + Math.round(banner2.size * bz) + 'px "Segoe UI",sans-serif';
      ctx.fillStyle = banner2.c === 'rainbow' ? rainbow(W / 2, ctx.measureText(banner2.s).width, t) : banner2.c; ctx.shadowColor = banner2.c === 'rainbow' ? '#ffd36a' : banner2.c; ctx.shadowBlur = 18;
      ctx.fillText(banner2.s, W / 2, banner2.y); ctx.shadowBlur = 0;
      ctx.font = '700 20px "Segoe UI",sans-serif'; ctx.fillStyle = '#fff3c0'; ctx.fillText(banner2.s2, W / 2, banner2.y + 30); ctx.globalAlpha = 1;
    }
    if (flash > 0) { ctx.fillStyle = 'rgba(' + flashC + ',' + (flash * 0.35) + ')'; ctx.fillRect(0, 0, W, H); }
    if (bannerT > 0) {
      var al = Math.min(1, bannerT / 0.6, (3.2 - bannerT) / 0.25 + 0.001);
      ctx.globalAlpha = Math.max(0, al) * 0.62; ctx.fillStyle = '#03050a'; ctx.fillRect(0, H / 2 - 100, W, 140);
      ctx.globalAlpha = Math.max(0, al); ctx.textAlign = 'center';
      // PR5: „LEVEL n“ groß, bunt und leuchtend, fliegt beim Start groß herein
      var lt = game.level ? 'LEVEL ' + game.level : obT('ÜBUNG'), lz = Math.round(48 * (1 + 0.5 * Math.max(0, 1 - (3.2 - bannerT) / 0.3)));
      ctx.font = '800 ' + lz + 'px "Segoe UI",sans-serif'; ctx.fillStyle = rainbow(W / 2, ctx.measureText(lt).width, t);
      ctx.shadowColor = 'hsl(' + Math.floor(t * 240 % 360) + ',100%,60%)'; ctx.shadowBlur = 22; ctx.fillText(lt, W / 2, H / 2 - 52); ctx.shadowBlur = 0;
      if (game.level) { ctx.fillStyle = 'rgba(255,154,31,.8)'; ctx.font = '700 13px "Segoe UI",sans-serif'; ctx.fillText('/ ' + LEVELS.length, W / 2, H / 2 - 34); }
      ctx.fillStyle = '#ffffff'; ctx.font = '700 30px "Segoe UI",sans-serif'; ctx.fillText(obLvName(game.levelName).toUpperCase(), W / 2, H / 2 - 2);
      ctx.fillStyle = '#9fb0c4'; ctx.font = '15px "Segoe UI",sans-serif'; ctx.fillText(obLvDesc(game.levelDesc) + (game.practice ? obT(' · Übung (kein Highscore)') : ''), W / 2, H / 2 + 24);
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
    for (var k = 0; k < 4; k++) rings.push({ x: W / 2, y: H / 2 - 60, r: 140 + k * 60, t: 0, c: 'hsl(' + (k * 80 + 20) + ',100%,62%)', lw: 3 });
    for (k = 0; k < 46; k++) { var a = Math.random() * 6.2832, v = 120 + Math.random() * 260; parts.push({ x: W / 2, y: H / 2 - 60, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6, s: 2 + Math.random() * 2.5, life: 1.1, max: 1.1, c: 'hsl(' + Math.floor(Math.random() * 360) + ',100%,65%)' }); }
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
      } else if (e.type === 'slide') {                                // Gleiter-Bonus: vorhandener Combo-Bonus-Ton
        sound.comboBonus(e.n); buzz(e.extreme ? [40, 40, 60] : 35);
        banner2 = { s: e.extreme ? 'EXTREME SLIDE ×' + e.n : 'SLIDE ×' + e.n, s2: '+' + fmtScore(e.pts), c: e.extreme ? 'rainbow' : '#ffd36a', size: e.extreme ? 46 : 36, y: H * 0.26, life: 1.9, max: 1.9 };
        for (k = 0; k < (lite ? 12 : 30); k++) { a = Math.random() * 6.2832; v = 90 + Math.random() * 200; parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, s: 2 + Math.random() * 2.5, life: 0.9, max: 0.9, c: e.extreme ? 'hsl(' + Math.floor(Math.random() * 360) + ',100%,65%)' : '#ffd36a' }); }
        if (e.extreme) { shake = Math.max(shake, 0.3); shakeA = Math.max(shakeA, 5); flash = Math.max(flash, 0.3); flashC = '255,211,106'; }
      } else if (e.type === 'skill') {                                // Geschicklichkeitsschüsse
        sound.combo(10);
        var sk2 = { long: 'LONG SHOT', rush: 'ORE RUSH', bank: 'BANK SHOT', kick: 'FREIGHTER KICK' }[e.kind] || 'SKILL SHOT';
        if (!banner2 || banner2.life < 0.6) banner2 = { s: sk2, s2: '+' + fmtScore(e.pts), c: '#7fe8ff', size: 32, y: H * 0.44, life: 1.5, max: 1.5 };
        else texts.push({ x: W / 2, y: H * 0.5, vy: -30, life: 1.4, max: 1.4, s: sk2 + ' +' + e.pts, c: '#7fe8ff', size: 22, glow: 1 });
        rings.push({ x: e.x, y: e.y, r: 60, t: 0, c: '#7fe8ff', lw: 3 });
      } else if (e.type === 'lastHit') {                              // letzte Erzader: kurze Zeitlupe + Zoom
        fxSlow = 1.1; fxZx = e.x; fxZy = e.y; flash = Math.max(flash, 0.35); flashC = '255,225,150';
        rings.push({ x: e.x, y: e.y, r: 120, t: 0, c: '#ffe14c', lw: 5 });
      } else if (e.type === 'rock') {
        shake = Math.max(shake, 0.35); shakeA = Math.max(shakeA, 6);
      } else if (e.type === 'revive') {
        rings.push({ x: e.x, y: e.y, r: 40, t: 0, c: PCOL.revive.glow, lw: 3 });
      } else if (e.type === 'boom') {
        if (e.small) sound.armor(e.x); else { sound.boom(e.x); flash = Math.max(flash, 0.45); shake = Math.max(shake, 0.25); shakeA = Math.max(shakeA, 4); }   // Splitter: kleiner Knall; Smartbombe wackelt
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
        sound.combo(e.n); buzz(tier >= 3 ? [30, 30, 30] : 20);
        if (e.n === 5 || e.n === 10 || e.n === 20 || e.n === 40) { sound.comboTier(tier); }
        texts.push({ x: e.x, y: e.y - 36, vy: -46, life: 1.2, max: 1.2, s: 'COMBO ' + e.n + '!', c: '#ffe14c', size: 24, glow: 1 });
        texts.push({ x: W / 2, y: H / 2 - 160, vy: -16, life: 1.3 + tier * 0.2, max: 1.3 + tier * 0.2, s: cw + ' ×' + e.n, c: 'rainbow', size: 30 + tier * 8, glow: 1, pop: 1 });
        rings.push({ x: e.x, y: e.y, r: 60 + e.n * 2, t: 0, c: '#ffe14c', lw: 3 });
        if (tier >= 2) rings.push({ x: W / 2, y: H / 2 - 170, r: 120 + tier * 40, t: 0, c: 'hsl(' + (tier * 70) + ',100%,65%)', lw: 2 + tier });
        for (k = 0; k < 10 + tier * 12; k++) { a = Math.random() * 6.2832; v = 90 + Math.random() * (120 + tier * 60); parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, s: 2 + Math.random() * 2.5, life: 0.9, max: 0.9, c: 'hsl(' + Math.floor(Math.random() * 360) + ',100%,65%)' }); }
        shake = Math.max(shake, 0.2 + tier * 0.1); shakeA = Math.max(shakeA, 2 + tier * 2.5);
        flash = Math.max(flash, 0.15 + tier * 0.1); flashC = ['255,225,76', '76,195,255', '255,107,214', '180,107,255'][tier - 1];
      } else if (e.type === 'comboBonus') {
        sound.comboBonus(e.hits);
        texts.push({ x: W / 2, y: H / 2 - 120, vy: -26, life: 2.0, max: 2.0, s: 'COMBO ×' + e.hits, c: '#ffe14c', size: 34 });
        texts.push({ x: W / 2, y: H / 2 - 84, vy: -26, life: 2.0, max: 2.0, s: '+' + fmtScore(e.pts) + tt(' Combo-Bonus', ' combo bonus'), c: '#fff3b0', size: 20 });
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
    game.balls.forEach(function (b) {
      var tr = b.trail || (b.trail = []); tr.push({ x: b.x, y: b.y }); if (tr.length > 16) tr.shift();
      var bs = Math.hypot(b.vx, b.vy);
      if (b.railT < 0.05 && b.spx != null && bs > 140 && Math.random() < (lite ? 0.35 : 0.9)) {   // Funkenstrahl entlang der Bahn
        for (var q = 0; q < (lite ? 1 : 3); q++) parts.push({ x: b.spx, y: b.spy, vx: -b.vx * (0.2 + Math.random() * 0.3) + (Math.random() - 0.5) * 80, vy: -b.vy * 0.2 - 40 - Math.random() * 80, s: 1.5 + Math.random() * 1.5, life: 0.35, max: 0.35, c: (b.slideN || 0) >= 6 ? '#ffd36a' : '#ffe9c0' });
      }
    });
    if (banner2) { banner2.life -= dt; if (banner2.life <= 0) banner2 = null; }
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
  function resetFx() { fxSlow = 0; banner2 = null; texts = []; parts = []; rings = []; bolts = []; hbeams = []; flash = 0; shake = 0; shakeA = 0; shown = {}; newRank = 0; beamPts = null; laserT = 0; catchT = 0; bumpT = {}; renderScores(0); bannerT = 3.2; updateHud(); }
  /* --- Spielstand der Kampagne --- */
  /* Übernahme 4.0: einmalig alten Spielstand und Level-Bestwerte zurücksetzen (die Level sind neu), Highscore bleibt; Hinweis beim ersten Öffnen */
  var obReset = false;
  try { if (store.getItem(progKey + '-v4') !== '1') { obReset = !!(store.getItem(progKey) || store.getItem(opts.bestKey || BEST_KEY)); store.removeItem(progKey); store.removeItem(opts.bestKey || BEST_KEY); store.setItem(progKey + '-v4', '1'); } } catch (e) { }
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
      if (game.bestSlide >= 6) card.appendChild(el('p', null, tt('Bester Gleiter: ' + game.bestSlide + ' Steine (+' + fmtScore(game.slideTotal) + ')', 'Best slide: ' + game.bestSlide + ' stones (+' + fmtScore(game.slideTotal) + ')')));
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
    if (!paused) { game.update(fxSlow > 0 ? dt * 0.35 : dt); handleEvents(); tickEffects(dt); if (fxSlow > 0) fxSlow = Math.max(0, fxSlow - dt); }
    updateHud();
    draw(ts / 1000);
  }

  resize(); renderScores(0); updateHud(); bannerT = 3.2;
  if (obReset) {                                                    // Hinweis nach der Übernahme
    var rc = el('div', 'ob-card'); rc.appendChild(el('h2', null, tt('Neuer OmniBreaker', 'New OmniBreaker')));
    rc.appendChild(el('p', null, tt('150 neue Level, Steinbahnen, Gleiter und neue Items. Dein alter Spielstand passt nicht mehr zu den neuen Leveln und wurde zurückgesetzt – dein Highscore bleibt.', '150 new levels, stone rails, slides and new power-ups. Your old progress does not fit the new levels and was reset – your high score stays.')));
    var rr = el('div', 'ob-row'), rb = el('button', 'ob-btn ob-primary', tt('Los geht’s', 'Let’s go')); rb.type = 'button'; rb.addEventListener('click', hideMsg); rr.appendChild(rb); rc.appendChild(rr);
    msg.appendChild(rc); msg.classList.add('ob-show');
  }
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
    setBg: setBg,
    preview: function (L, t) {                                     // Vorschau-Werkzeug: Level zeigen, Bewegung bei Zeit t angehalten, ohne Einblendung
      startPractice(L); setPausedSilent(true); hideMsg(); bannerT = 0; texts = []; parts = []; rings = []; banner2 = null; fxSlow = 0;
      game.mt = t || 0; game._placePegs(); game.aimPoint = null; game.setAim(0);
    },
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
  makeLogo: makeLogo,   // 14.10.: Logo für Hüllen (Handy-Kopf, Startknopf)
  version: '4.0',
  CFG: CFG, LEVELS: LEVELS, POWER_NAMES: POWER_NAMES, t: obT, en: OB_EN, lvName: obLvName, lvDesc: obLvDesc, Game: Game, Highscores: Highscores, Progress: Progress, createSound: createSound,
  makeLayout: makeLayout, buildLevel: buildLevel, sceneOf: obSceneOf, K: OBK, HAND: OB2_LEVELS, buildStoneRail: buildStoneRail, obStonePieces: obStonePieces, obRailSweep: obRailSweep, mvAt: mvAt, segNear: segNear, fmtScore: fmtScore, mount: mount
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

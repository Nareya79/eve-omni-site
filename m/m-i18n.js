/* EVEOmni Mobile – Sprache (Englisch ist Standard, Deutsch umschaltbar).
   Quelltexte bleiben deutsch; im englischen Modus übersetzt ein kleiner Übersetzer alle Texte beim Erscheinen
   (Wörterbuch unten). Zahlen, Einheiten und Datum folgen der Sprache. Eigener Schlüssel: eve-omni-m-lang. */
(function(){
"use strict";
var KEY="eve-omni-m-lang";
function get(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
function put(v){try{localStorage.setItem(KEY,v);}catch(e){}}
var stored=get(),lang=(stored==="de"||stored==="en")?stored:"en",en=lang==="en";
var I={lang:lang,en:en,stored:function(){var s=get();return s==="de"||s==="en";},
  set:function(l){put(l==="de"?"de":"en");location.reload();},
  dec:en?".":",",th:en?",":".",loc:en?"en-GB":"de-DE",
  /* Zahl mit Tausendertrennzeichen (ganz) */
  int:function(n){var neg=n<0,s=Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,I.th);return (neg?"-":"")+s;},
  /* Dezimalzahl mit Sprach-Komma/Punkt, ohne Tausender */
  fix:function(n,d){return (Math.round(n*Math.pow(10,d))/Math.pow(10,d)).toFixed(d).replace(".",I.dec);},
  units:en?["K","M","B"]:["Tsd.","Mio.","Mrd."]};
window.OmniI18n=I;
try{localStorage.setItem("eve-zentrale-lang-v1",en?"en":"de");}catch(e){}   /* OmniBreaker liest diese Sprache */
document.documentElement.lang=en?"en":"de";
if(!en)return;
var P=[
["Aktualisieren","Refresh"],["Zurück","Back"],["Menü","Menu"],
["Melde dich mit deinem EVE-Charakter an.","Log in with your EVE character."],
["Dein Login bleibt nur in diesem Browser auf deinem Handy.","Your login stays only in this browser on your phone."],
["Mit EVE-Charakter einloggen","Log in with EVE character"],["Weiteren Charakter einloggen","Add another character"],
["Gesamt","Total"],["Charaktere","Characters"],["Mehr","More"],["Eingeloggte Charaktere","Logged-in characters"],["Alle ausloggen","Log out all"],
["Fanprojekt, nicht mit CCP verbunden.","Fan project, not affiliated with CCP."],["Entfernen","Remove"],
["Gewinne","Profits"],["Wert","Value"],["Industrie","Industry"],["Spiel","Game"],
["Startbild beim Öffnen zeigen","Show start screen when opening"],["Navigationsleiste","Navigation bar"],
["Wähle bis zu 4 Punkte für die untere Leiste (Mehr bleibt immer dabei).","Pick up to 4 items for the bottom bar (More is always included)."],
["Höchstens 4 – erst einen abwählen.","At most 4 – deselect one first."],
["Sprache","Language"],
["Was du wo hast","What you have where"],["netto pro Stück und gesamt","net per piece and total"],["Sprünge, Sicherheit, Kills","Jumps, security, kills"],
["Wertschätzer","Appraisal"],["Liste einfügen → Jita-Wert","Paste list → Jita value"],["Planeten (PI)","Planets (PI)"],["Extraktoren und Lager","Extractors and storage"],
["Industrie & Verträge","Industry & Contracts"],["Jobs, Verträge, Mining","Jobs, contracts, mining"],["Watchlist vom PC","Watchlist from PC"],
["Trades, Läufe, Merkliste (vom PC abgeglichen)","Trades, runs, price list (synced from PC)"],["Spiel + Bestenliste","Game + leaderboard"],
["Piloten online","pilots online"],["Serverstatus nicht abrufbar.","Server status unavailable."],
["Dieser Browser kann den sicheren Login nicht (crypto fehlt).","This browser cannot do the secure login (crypto missing)."],
["Login konnte nicht gestartet werden","Could not start login"],
["Login abgelehnt: EVE kennt eine der angefragten Berechtigungen nicht. Bitte melde das (GitHub/Discord).","Login rejected: EVE does not know one of the requested permissions. Please report this (GitHub/Discord)."],
["Login abgebrochen: Die Anmeldung wurde bei EVE nicht bestätigt.","Login cancelled: the sign-in was not confirmed at EVE."],
["Login abgelehnt: ungültige Anfrage (Client). Bitte die App neu laden.","Login rejected: invalid request (client). Please reload the app."],
["Login fehlgeschlagen","Login failed"],
["Sicherheitscheck fehlgeschlagen (state) – bitte Login erneut starten.","Security check failed (state) – please start login again."],
["Kein Code-Verifier – bitte Login erneut starten.","No code verifier – please start login again."],
["Token-Austausch fehlgeschlagen","Token exchange failed"],["Sitzung von","Session of"],
["abgelaufen – bitte neu einloggen.","expired – please log in again."],["abgelaufen","expired"],
["Standort: Berechtigung fehlt","Location: permission missing"],["Berechtigung fehlt – bitte neu einloggen.","Permission missing – please log in again."],
["Berechtigung fehlt – neu einloggen.","Permission missing – log in again."],["Berechtigung fehlt","Permission missing"],["fehlt","missing"],
["im Weltraum","in space"],["seit","since"],["Lade Preise","Loading prices"],["Lade","Loading"],["Abgerufen","Updated"],["abgerufen am","fetched on"],["abgerufen","fetched"],
["Kopiert","Copied"],
["Kauf","Buy"],["Verkauf","Sell"],["Stück verkauft","pcs sold"],["Netto pro Stück","Net per piece"],["Stück","pcs"],["Struktur","Structure"],
["läuft ab in","expires in"],["Prüfe Konkurrenz","Checking competition"],["Keine offenen Orders.","No open orders."],
["Keine Konkurrenz am Ort","No competition at location"],["Vorne","Ahead"],["Konkurrenz nicht prüfbar","Competition not checkable"],["Konkurrenz","competitor"],
["Überboten","Outbid"],["bester Preis","best price"],["neu","new"],
["Tg.","d"],["Std.","h"],["Min.","min"],["Kills/Std","kills/h"],
["Keine Skills in der Warteschlange!","No skills in the queue!"],["Jetzt","Now"],["auf Stufe","to level"],["Stufe","Level"],["noch","remaining"],
["Warteschlange","Queue"],["endet in","ends in"],["endet","ends"],["Bald leer – neue Skills eintragen!","Almost empty – add new skills!"],["bald leer","almost empty"],
["Skillpunkte","Skill points"],["Nicht verteilt","Unallocated"],["läuft","running"],["fertig","done"],["Dauer","Duration"],
["Transaktionen","Transactions"],["Übersicht","Overview"],["Kontostand","Balance"],["Danach","After"],["Einträge geladen","entries loaded"],["zeige","showing"],
["Letzte 24 Std.","Last 24 h"],["Letzte 7 Tage","Last 7 days"],["Einnahmen","Income"],["Ausgaben","Expenses"],["Saldo","Net"],
["davon Verkaufssteuer","of which sales tax"],["davon Maklergebühren","of which broker fees"],
["Das ist Cashflow (Geld rein/raus), nicht Gewinn. Gewinn findest du unter Mehr › Gewinne. ESI liefert höchstens 30 Tage.","This is cash flow (money in/out), not profit. Find profit under More › Profits. ESI delivers 30 days at most."],
["Gekauft","Bought"],["Verkauft","Sold"],
["Markt","Market"],["Verkaufssteuer","Sales tax"],["Maklergebühren","Broker fees"],["Maklergebühr","Broker fee"],["Marktauftrag (Treuhand)","Market order (escrow)"],["Handel Spieler","Player trade"],
["Spende","Donation"],["Kopfgeld","Bounty"],["Vertragsbelohnung","Contract reward"],["Vertragspfand","Contract collateral"],["Vertragsgebühr","Contract fee"],["Vertrag","Contract"],
["Industriesteuer","Industry tax"],["Herstellung","Manufacturing"],["Versicherung","Insurance"],["Corp-Entnahme","Corp withdrawal"],["Bürogebühr","Office fee"],
["Missionsbelohnung","Mission reward"],["Missionsbonus","Mission bonus"],["PI-Exportsteuer","PI export tax"],["PI-Importsteuer","PI import tax"],["Klonsprung","Clone jump"],
["Wiederaufbereitung","Reprocessing"],["Tagesziel","Daily goal"],
["Suchen (Name oder Ort)","Search (name or place)"],["Orte","places"],["Posten","items"],["Gegenstände in Containern/Schiffen nicht aufgelistet","items in containers/ships not listed"],
["Gewinn netto (geschätzt)","Profit net (estimated)"],["Verkäufe mit zugeordnetem Einkauf (FIFO) minus Verkaufssteuer","Sales matched with purchases (FIFO) minus sales tax"],
["minus Maklergebühren aus dem Journal","minus broker fees from the journal"],["enthält auch Preisänderungen","also includes price changes"],["Nur die letzten 30 Tage.","Last 30 days only."],
["Umsatz","Revenue"],["Einkauf","Cost"],["Steuer","Tax"],["Keine Verkäufe mit Einkauf im Zeitraum.","No sales with purchases in the period."],
["Von (Systemname)","From (system name)"],["Nach (Systemname)","To (system name)"],["Mein Standort als Start","My location as start"],
["Sicherste","Safest"],["Kürzeste","Shortest"],["Unsicherste","Least safe"],["Route berechnen","Calculate route"],["Berechne","Calculating"],
["Systemname nicht gefunden","System name not found"],["(englische Namen)","(English names)"],["Sprünge","jumps"],["Systeme","systems"],["System","system"],
["unter 0,5 (Lowsec/Nullsec)","below 0.5 (lowsec/nullsec)"],["nur Highsec","highsec only"],["Route kopieren","Copy route"],["Ziel im Spiel setzen","Set destination in game"],
["Ziel gesetzt","Destination set"],["Kills der letzten Stunde laut ESI","Kills in the last hour per ESI"],
["Liste aus dem Spiel einfügen (Inventar, Multibuy, Fitting …). Englische Namen.","Paste a list from the game (inventory, multibuy, fitting …). English names."],
["Bewerten (Jita 4-4)","Appraise (Jita 4-4)"],["Nichts erkannt.","Nothing recognised."],["Suche Namen","Looking up names"],["Name nicht erkannt","Name not recognised"],
["Kein Preis in Jita 4-4","No price in Jita 4-4"],["Verkaufsorder (bestes Angebot, brutto)","Sell order (best offer, gross)"],["abzüglich Steuer","minus tax"],["und Broker","and broker"],
["netto","net"],["Sofortverkauf an Kauforders","Instant sale to buy orders"],["Waren","items"],["nicht erkannt","not recognised"],["nur die ersten 60","first 60 only"],
["Keine Planeten.","No planets."],["Extraktoren","extractors"],["Planeten","planets"],["rot = Extraktor endet in unter 8 Std.","red = extractor ends in under 8 h"],
["Zeiteffizienz","Time efficiency"],["Materialeffizienz","Material efficiency"],["Kopie","Copying"],["Reaktion","Reaction"],
["Industrie-Jobs","Industry jobs"],["aktiv","active"],["Keine laufenden Jobs.","No running jobs."],["Verträge","Contracts"],["offen","open"],
["Tausch","Item exchange"],["Kurier","Courier"],["Auktion","Auction"],["Keine offenen Verträge.","No open contracts."],
["Mining (letzte Einträge)","Mining (latest entries)"],["Keine Mining-Einträge.","No mining entries."],
/* Watchlist vom PC */
["Sync-Code","Sync code"],
["Den Code zeigt EVE Omni am PC unter Einstellungen › Daten › „Mit Handy abgleichen“. Der Code bleibt nur auf deinen Geräten.","EVE Omni on the PC shows the code under Settings › Data › “Sync with phone”. The code stays only on your devices."],
["Speichern und laden","Save and load"],["Trennen","Disconnect"],["Ändern","Change"],["Verbunden","Connected"],["Stand vom PC","Status from PC"],["Stand","as of"],
["Der Code ist nicht gültig (20 Zeichen, Buchstaben und Ziffern).","The code is not valid (20 characters, letters and digits)."],
["Auf dem Server liegt zu diesem Code noch nichts. Am PC „Jetzt senden“ drücken.","The server has nothing for this code yet. Press “Send now” on the PC."],
["Abgleich ging nicht","Sync failed"],["Der Code passt nicht zu den Daten.","The code does not match the data."],
["Getrennt. Der Code ist auf diesem Handy gelöscht.","Disconnected. The code was deleted from this phone."],["Gespeicherter Stand vom PC","Saved status from PC"],
["Läufe","Runs"],["Merkliste","Watchlist"],["Erledigt","Done"],["Keine Trades.","No trades."],["Keine aktiven Läufe.","No active runs."],
["Die Preis-Merkliste ist leer.","The price watchlist is empty."],["erledigt","done"],["gekauft, verkaufen","bought, sell"],["einkaufen","buying"],["unterwegs/verkaufen","in transit/selling"],
["Marge","Margin"],["Kaufen zu (Plan)","Buy at (plan)"],["Verkaufen zu (Plan)","Sell at (plan)"],["Plan netto","Plan net"],["pro Stück","per piece"],["gesamt","total"],
["Kopieren","Copy"],["Lauf nach","Run to"],["weitere","more"],
["Fortschritt wird geladen","Loading progress"],["Lager","In stock"],["Gewinn bisher (netto, geschätzt)","Profit so far (net, estimated)"],
["Verlust bisher (netto, geschätzt)","Loss so far (net, estimated)"],["Noch nichts verkauft.","Nothing sold yet."],["Erwartet bei Verkauf des Lagers (Plan)","Expected when selling the stock (plan)"],
["Charakter nicht auf dem Handy eingeloggt – kein Fortschritt.","Character not logged in on this phone – no progress."],["Fortschritt nicht abrufbar","Progress unavailable"],
["Keine Käufe/Verkäufe seit dem Anlegen gefunden.","No purchases/sales found since it was created."],["Summe aller angezeigten Trades","Sum of all shown trades"],
["überboten","outbid"],["geplant netto","planned net"],["alle auf","expand all"],["alle zu","collapse all"],["Größe","Size"],["Stück zu","pcs at"],
["Deine Verkaufsorder","Your sell order"],["Deine Kauforder","Your buy order"],["Keine Order gefunden","No order found"],["Noch keine Kauforder","No buy order yet"],["Noch keine Verkaufsorder","No sell order yet"],["Darstellung","Appearance"],["Benachrichtigungen","Notifications"],["Meldungen kommen, solange die App geöffnet ist oder kurz im Hintergrund läuft. Mit Push kommen sie auch bei geschlossener App.","Notifications arrive while the app is open or running briefly in the background. With push they also arrive when the app is closed."],["Order überboten","Order outbid"],["Skill-Warteschlange fast leer (unter 24 Std.)","Skill queue almost empty (under 24 h)"],["Skill-Warteschlange fast leer","Skill queue almost empty"],["Extraktor läuft aus (unter 8 Std.)","Extractor running out (under 8 h)"],["Extraktor läuft aus","Extractor running out"],["Trade-Ziel erreicht (alles verkauft)","Trade goal reached (all sold)"],["Trade-Ziel erreicht","Trade goal reached"],["alle verkauft","all sold"],["Test-Meldung senden","Send test message"],["Benachrichtigungen sind an ✓","Notifications are on ✓"],["So sieht eine Meldung aus.","This is what a message looks like."],["Zuletzt geprüft","Last checked"],["Auf dem Handy blockiert – in den Browser-Einstellungen für diese Seite erlauben.","Blocked on this phone – allow it in the browser settings for this site."],["Dieser Browser kann keine Benachrichtigungen.","This browser cannot show notifications."],["An","On"],["Aus","Off"],["Überboten:","Outbid:"],["Einstellungen","Settings"],["Darstellung, Sprache, Leiste, Charaktere, Abgleich mit dem PC","Appearance, language, bar, characters, sync with PC"],["Abgleich mit dem PC","Sync with PC"],["Nicht verbunden. Den Code zeigt EVE Omni am PC unter Einstellungen › Daten › „Mit Handy abgleichen“.","Not connected. EVE Omni on the PC shows the code under Settings › Data › “Sync with phone”."],["Nicht verbunden.","Not connected."],["Speichern","Save"],["Gespeichert. Die Watchlist holt den Stand beim nächsten Öffnen.","Saved. The watchlist fetches the data next time you open it."],["Gespeichert (ohne Code).","Saved (without code)."],["‹ Mehr","‹ More"],["Farbschema","Colour scheme"],["Automatisch","Automatic"],["Photon · Türkis","Photon · turquoise"],["Caldari · Stahlblau","Caldari · steel blue"],["Amarr · Gold","Amarr · gold"],["Minmatar · Rost","Minmatar · rust"],["Gallente · Grün","Gallente · green"],["Hell · Tag","Light · day"],["Schwarz","Black"],["Sehr groß","Very large"],["Klein","Small"],["Normal","Normal"],["Groß","Large"],["Kompakt","Compact"],["Layout","Layout"],["Beste Konkurrenz","Best competitor"],["Marge","Margin"],["Plan","Plan"],
["Auch bei geschlossener App (Push)","Also when the app is closed (push)"],["Dafür muss die App mit dem Sync-Server verbunden sein (Abgleich mit dem PC). Überboten-Meldungen kommen vom PC-Programm, solange es läuft.","This requires the app to be connected to the sync server (Sync with PC). Outbid messages come from the PC program while it is running."],
["Erst unter „Abgleich mit dem PC“ verbinden.","Connect under “Sync with PC” first."],["Dieser Browser kann keine Push-Meldungen.","This browser cannot do push messages."],["Push eingerichtet ✓","Push is set up ✓"],["Push-Anmeldung ging nicht","Push setup failed"],["Sortieren","Sort"],["Datum","Date"],["Ort","Place"],["Gewinn","Profit"],["Verlust","Loss"],["verkauft","sold"],["gekauft","bought"],
["Wallet-Daten reichen nur 30 Tage zurück.","Wallet data only goes back 30 days."]
];
var map={},keys=[];P.forEach(function(p){map[p[0]]=p[1];keys.push(p[0]);});
keys.sort(function(a,b){return b.length-a.length;});
function esc(s){return s.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&");}
var L="A-Za-zÄÖÜäöüß",RX=new RegExp("(?<!["+L+"])(?:"+keys.map(esc).join("|")+")(?!["+L+"])","g");
function tr(s){return s.replace(RX,function(m){return map[m];});}
I.tr=tr;
function node(n){var v=n.nodeValue;var pe=n.parentNode;if(pe&&pe.closest&&pe.closest("#lang-pick,[data-keep]"))return;if(!v||!/[A-Za-zÄÖÜäöüß]/.test(v))return;var w=tr(v);if(w!==v)n.nodeValue=w;}
var ATT=["placeholder","aria-label","title"];
function elAttrs(e){ATT.forEach(function(a){var v=e.getAttribute&&e.getAttribute(a);if(v){var w=tr(v);if(w!==v)e.setAttribute(a,w);}});}
function walk(root){
  if(root.nodeType===3){node(root);return;}
  if(root.nodeType!==1)return;
  var t=root.tagName;if(t==="SCRIPT"||t==="STYLE"||t==="TEXTAREA")return;
  elAttrs(root);
  var w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,null),n;
  while((n=w.nextNode())){if(n.nodeType===3){if(n.parentNode&&/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentNode.tagName))continue;node(n);}else elAttrs(n);}
}
function start(){
  walk(document.body);
  new MutationObserver(function(ms){ms.forEach(function(m){
    if(m.type==="characterData")node(m.target);
    else if(m.type==="attributes")elAttrs(m.target);
    else m.addedNodes.forEach(walk);});}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATT});
}
if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
})();

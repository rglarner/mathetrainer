# Mathetrainer — Webübungen

Kleine, lokale Webseite mit zwei interaktiven Rechenübungen (Reihen & Plus/Minus) — optimiert für Desktop und Mobil (inkl. PWA‑Option).

## Projektstruktur (aktuell im Ordner `docs`)
- `docs/index.html` — Startseite
- `docs/reihenuebung.html` — Reihenübung (Multiplikation / Division)
- `docs/plusminusuebung.html` — PlusMinusÜbung (Addition / Subtraktion)
- `docs/links.html` — Sammlung deutschsprachiger Mathe‑Links
- `docs/manifest.json` — Web App Manifest (PWA)
- `docs/sw.js` — Service Worker (Offline‑Cache)
- `docs/css/styles.css` — Projekt‑CSS (inkl. Grid für Checkboxen, Timer, etc.)
- `docs/js/reihenuebung.js` — Logik für Reihenübung (Fragen, Timer, Bewertung)
- `docs/js/plusminusuebung.js` — Logik für Plus/Minus (Übertrag, Zahlenraum, Regeln)
- `docs/images/` — Icons (z. B. `mathetrainer180.png`, `mathetrainer192.png`, `mathetrainer512.png`)

## Funktionen (Kurzüberblick)

Allgemein
- Läuft komplett clientseitig — keine Daten werden an Server geschickt.
- Optionale PWA‑Unterstützung (Manifest, Service Worker, apple‑touch‑icon).
- Feste Timer‑Anzeige oben rechts während der Übung; in den letzten 10 Sekunden rot.
- Tastaturoptimierung auf Mobilgeräten: numerische Eingabe (inputmode, pattern), optional `type="tel"` wenn nötig.
- Ergebnisanzeige inkl. Note (Formel: Note = (5 / möglichePunkte * erreichtePunkte) + 1; gerundet auf 1 Dezimalstelle; Skala 1–6).

Reihenübung (`reihenuebung.html`)
- Auswahl: Multiplikation (Mal *) und/oder Division (Geteilt /).
- Auswahl der Reihen (1–12) per deutlich umrandeten Checkbox‑Grid.
- Maximaler Faktor (Dropdown 1–12), Anzahl Fragen (1–100), Zeitfenster (bis 20 Minuten).
- Neue Option: "Skalierung" (Dropdown)
  - Werte: "keine" (=1), 10, 100, 1000, 10000. Standard: "keine".
  - Darstellung/Platzierung: analog zur Faktorenauswahl als Dropdown im Formular.
  - Verhalten: Bei jeder generierten Aufgabe wird zufällig eine erlaubte Skalierung aus dem Bereich 1..gewähltemMax angewendet. Mit ~80% Wahrscheinlichkeit wird dabei eine Skalierung >1 (10/100/1000/10000) gewählt, sofern verfügbar.
  - Mathematische Anwendung:
    - Multiplikation: Skalierung wird auf beide Faktoren angewendet (z. B. bei Reihe 3 und Skalierung 10 → 30 × (faktor*10)).
    - Division: Skalierung wird auf Divisor und Quotient angewendet; Dividend wird so konstruiert, dass die Division ganzzahlig bleibt.
  - UI: Dropdown wird beim Start der Übung deaktiviert (wie andere Form‑Elemente) und beim Neustart wieder aktivierbar.
- Aufgaben werden generiert, Anzeige der verbleibenden Zeit, Bewertung und Feedback zu einzelnen Antworten.
- Reihenfolge der Faktoren bei Multiplikation wird zufällig vertauscht (Anzeigevariation).

PlusMinusÜbung (`plusminusuebung.html`)
- Auswahl: Addition - Plus (+) oder Subtraktion / Minus (−).
- Option "Mit Übertrag" (Erlaubt Zehnersprünge) als Checkbox.
- Auswahl der Summanden/Subtrahenden per Checkbox‑Grid (1–12).
- Neues Feld "Zahlenraum" (maximale Summe / maximaler Minuend; Bereich 10–100).
- Verhaltensregeln:
  - Addition ohne Übertrag: Summand1 aus Checkboxen, Summand2 so gewählt, dass Summe ≤ Zahlenraum und kein Überschreiten ganzer Zehner (10, 20, 30 …).
  - Addition mit Übertrag: Summand2 so gewählt, dass Summe ≤ Zahlenraum; Zehnersprünge erlaubt.
  - Subtraktion ohne Übertrag: Subtrahend aus Checkboxen; Minuend ≤ Zahlenraum; Ergebnis ≥ 0 und kein „Borrow“ über Zehnergrenzen.
  - Subtraktion mit Übertrag: Minuend ≤ Zahlenraum; Subtrahend aus Checkboxen, sonst keine Einschränkung.
- Reihenfolge von Summand1 / Summand2 wird bei Anzeige zufällig vertauscht.

Bedienung
- Formular validiert Eingaben; Start‑Button nur aktiv, wenn alle Parameter gültig sind.
- Nach Klick "Antworten einreichen" bleibt der Start‑Button inaktiv bis "Neu starten" gedrückt wird.
- Ergebnisseite zeigt Punkte und berechnete Note; einzelne Antworten werden als richtig/falsch markiert und mit Korrekturen angezeigt.
- Zusätzlicher Abstand unter Buttons für bessere Bedienung auf Mobilgeräten.

## Live‑Demo
Die Webseite ist auch online verfügbar: https://rglarner.github.io/mathetrainer/



PWA / iOS Hinweise
- Für GitHub Pages: Repository‑Einstellungen → GitHub Pages → Source: `docs` (falls gewünscht).
- iOS: Safari zeigt kein automatisches Install‑Prompt; Nutzer müssen "Zum Home‑Bildschirm" wählen. apple‑touch‑icon und apple‑mobile‑web‑app‑meta werden unterstützt; Service Worker wird in neueren iOS‑Versionen unterstützt.
- Stelle sicher, dass die Icon‑Dateien (`mathetrainer180.png`, `mathetrainer192.png`, `mathetrainer512.png`) in `docs/images/` vorhanden sind.

## Entwickeln / Anpassen
- HTML/JS/CSS liegen unter `docs/`. Änderungen dort sind sofort testbar via lokalem Server.
- Bei größeren Änderungen: Browser‑Cache leeren, Service Worker ggf. in DevTools deaktivieren oder `sw.js` Version erhöhen, damit neue Assets geladen werden.

Viel Erfolg beim Weiterentwickeln und Testen!
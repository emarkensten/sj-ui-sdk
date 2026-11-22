# Mätdata: KB mot sj-ui

Underlag för beslutet om UI SDK. Alla siffror gäller samma fem komponenter (FlowButton, Switch, Select, DatePicker, DepartureCard) med **samma KB-props** på båda sidor, och går att köra om med kommandona nedan. Uppmätt 22 november 2026, på gren `claude/project-thread-zedpac`.

## Sammanfattning

| Mått | KB | sj-ui | Kommentar |
|---|---|---|---|
| Paketstorlek, alla fem, gzip | 303 kB JS | 166 kB JS + 12 kB CSS | 41 % mindre. Utan tågbilder: KB 194 kB, sj-ui 104 kB |
| Prop-täckning | | 295 av 295 KB-props | Alla KB:s egna och MUI:s props finns, plus HTML-attributen |
| Pixelparitet, 1000 px | | 306 av 308 identiska | Ljust och mörkt, 154 varianter. De 2 avvikande är ett KB-fel som rättats med flit |
| Pixelparitet, 375 px | | 306 av 308 identiska | Mobil, ljust och mörkt. Samma 2 avvikelser som på desktop |
| Renderingstid, produktion | 100 % | 52–88 % | sj-ui är snabbare i alla fem fallen |
| axe | | Inga nya fel | sj-ui har samma kontrastfel som KB, inga fler |
| SSR och hydrering | | Fungerar | Utan hydreringsvarningar, i testsviten |
| Tester | | 26 av 26 gröna | Beteende, SSR, streaming, hydrering, agent |

## Paketstorlek

`npm run size` och `node size/per-component.mjs` i `apps/storybook`. Vite-bygge, minifierat och gzip, utan React.

| Komponent | KB, JS gzip | sj-ui, JS gzip |
|---|---|---|
| FlowButton | 35,4 kB | 13,0 kB |
| Switch | 28,9 kB | 1,1 kB |
| Select | 125,9 kB | 75,2 kB |
| DatePicker | 155,6 kB | 76,0 kB |
| DepartureCard | 209,6 kB | 85,0 kB |
| Alla fem tillsammans | 303 kB | 166 kB |

sj-ui:s CSS (alla komponenter och legacy-lagret) är 12,2 kB gzip. KB:s största delar är `@mui/material` (193 kB minifierat), `@mui/x-date-pickers`, `date-fns` och `@mui/system`. sj-ui:s största del är tågbilderna i DepartureCard (inbäddad SVG, cirka 62 kB gzip), sedan `@ui-sdk/core`.

En komponent för sig blir 1,7–26 gånger mindre. Tillsammans blir skillnaden mindre, eftersom KB:s komponenter delar MUI.

## Prop-täckning

`node scripts/prop-coverage.mjs` i `apps/storybook` jämför KB:s och sj-ui:s typer. Full rapport: [prop-coverage.md](prop-coverage.md).

| Komponent | KB:s egna och MUI:s props | HTML-attribut |
|---|---|---|
| FlowButton | 33 av 33 | 284 av 284 |
| Switch | 11 av 11 | 303 av 303 |
| FormControlLabel | 23 av 23 | 276 av 276 |
| Select | 66 av 66 | 268 av 268 |
| MenuItem | 31 av 31 | 276 av 276 |
| DatePicker | 74 av 74 | 2 av 2 |
| DepartureCard | 57 av 57 | |

I DatePicker tas 41 props emot utan att göra något, eftersom KB inte heller läser dem (till exempel `onBlur`, `inputRef` och `InputProps`, ärvda från TextField). De står i typerna som `KbIgnoredProp`, så att koden kompilerar oförändrad. Avsiktliga skillnader i beteende står i [avsiktliga-skillnader.md](avsiktliga-skillnader.md). Alla är rättade fel i KB.

## Pixelparitet

Varje story under *Jämförelse/* i Storybook visar KB och sj-ui sida vid sida med samma props. Skriptet tar en bild av båda, räknar pixlar som skiljer (pixelmatch, tröskel 0,1) och jämför computed styles för text och kontroller. 154 varianter av de fem komponenterna, i ljust och mörkt läge, vid 1000 px och 375 px.

| Bredd | Identiska | Avvikande |
|---|---|---|
| 1000 px | 306 av 308 | 2: Select *Tom med platshållare*, ljust och mörkt (0,8 %) |
| 375 px | 306 av 308 | 2: samma Select-variant (1,0 %) |

Avvikelsen i Select är ett KB-fel: med `displayEmpty` och tomt värde lägger KB etiketten ovanpå platshållaren, så två texter syns på varandra. sj-ui lyfter etiketten. Se [avsiktliga-skillnader.md](avsiktliga-skillnader.md).

Öppna lägen mättes för sig: DatePickers kalender skiljer 0,2–0,9 % (kantutjämning och den avsiktligt inaktiverade pilen till föregående månad). På Macen var DatePickers stängda fält identiskt i 23 av 23 varianter.

**Det som inte mäts med pixlar:** text renderas med `system-ui` som reservtypsnitt i sj-ui och `arial` i KB. Det syns bara om SJ:s typsnitt inte laddas.

## Renderingstid

Storyn *Mätning/Prestanda* monterar många exemplar av en komponent, växelvis KB och sj-ui, sju omgångar, och mäter från start till första bildrutan efter Reacts commit. Tabellen visar medianen i ett produktionsbygge av Storybook i Chromium (`node scripts/perf.mjs <url>`).

| Komponent | Antal | KB, ms | sj-ui, ms | sj-ui av KB |
|---|---|---|---|---|
| DepartureCard | 100 | 241 | 125 | 52 % |
| Select | 100 | 133 | 117 | 88 % |
| DatePicker | 100 | 147 | 98 | 66 % |
| FlowButton | 300 | 55 | 33 | 60 % |

Molnmaskinen körde andra tester samtidigt, så de absoluta tiderna är högre än på en vanlig dator. Ordningen växlar varje omgång, så jämförelsen är rättvis.

## Tillgänglighet

**axe** (axe-core, alla regler) på öppna och stängda lägen i ljust och mörkt: sj-ui ger inga fel som KB inte har. De gemensamma felen kommer från SJ:s färger:

- Slutsåld och inställd DepartureCard: grå text (#949494 ljust, #7d7d7d mörkt) har kontrasten 3,0:1 respektive 4,0:1, under 4,5:1.
- Vald dag i DatePicker: vit text på grönt, 3,0:1. Samma färger i KB, men axe kunde inte räkna på KB:s version.
- Övriga varningar (landmärken, rubriknivå 1) gäller Storybooks sida, inte komponenterna.

**Tangentbord:** flödena i KB (Tab, pilar, Enter, Escape, Home/End, sökning med bokstäver i Select, månad och år i DatePicker) fungerar likadant. Testat med Playwright, delvis i testsviten (`test/legacy-behaviour.test.tsx`).

**VoiceOver i Safari** (Mac, november 2026):

- DatePicker: läser likadant som KB, fältet, kalendern och valet.
- DepartureCard: kortets text för skärmläsare är KB:s ord för ord, med tågnummer och kommatecken. 46 av 49 varianter är identiska, de 3 andra är rättade fel i KB (se avsiktliga-skillnader.md). Jämfört i tillgänglighetsträdet, inte med VoiceOver.
- Select: när listan öppnas säger VoiceOver "2 resenärer, text, 2 av 4" i sj-ui och "2 resenärer, markerad, 2 av 4" i KB. Tillgänglighetsträdet är detsamma. Felsökning pågår med en automatiserad VoiceOver-svit.

FlowButton, Switch och DepartureCard är inte provade med VoiceOver än. Det gör den automatiserade sviten.

**Mörkt läge** ingår i paritetsmätningen ovan. Högkontrast och forced colors är inte mätta mot KB.

## SSR och hydrering

`npm test` i roten. sj-ui renderas med `renderToString` och `renderToPipeableStream` och hydreras sedan i jsdom utan varningar. Testsidan `test/fixtures/legacy-page.tsx` använder KB:s props rakt av.

## Vad UI SDK sparade

Se [rapporten](ui-sdk-rapport.md).

## Köra om

```bash
npm test                                   # 26 tester
cd apps/storybook
npm run size                               # paketstorlek
node size/per-component.mjs                # per komponent
node scripts/prop-coverage.mjs             # skriver docs/prop-coverage.md
npm run build-storybook && npx http-server storybook-static -p 6007
node scripts/perf.mjs http://127.0.0.1:6007   # renderingstid
```

Paritetsskriptet och axe-körningen ligger än så länge utanför repot. De flyttas in med den automatiserade testsviten.

# Tillgänglighetssvit: KB mot sj-ui

Ett kommando som jämför KB (MUI) och sj-ui i Storybooks jämförelser (*Jämförelse/…*) och skriver en rapport per komponent och story. Tanken är att testa i minuter i stället för timmar: datorn klickar, lyssnar och jämför, och en människa tittar bara på det som skiljer.

```bash
cd tools/a11y-harness
npm install
npm run setup:mac          # en gång på en Mac: WebKit och Guidepup (behörigheter för VoiceOver)
npm run a11y               # allt
```

Rapporten hamnar i `report/`: `index.html` att läsa, `RAPPORT.md` att klistra in och `results.json` med allt råmaterial.

## Vad den kontrollerar

| Del | Hur | Var | Tid |
|---|---|---|---|
| Tillgänglighetsträdet i vila | Playwrights `ariaSnapshot` (roll, namn, tillstånd) för hela sidan, en sida i taget | Alla datorer, även molnet | Sekunder per story |
| Tangentbordsflöden | Tab, Enter, Space, pilar och Esc enligt `scenarios.mjs`. Efter varje tangent: vad har fokus (roll, namn, tillstånd, synlig fokusmarkering) och hur trädet ändrats | Alla datorer | Sekunder per story |
| axe | axe-core på sidan (regler om sidan runt storyn är avstängda) | Alla datorer | Ingår ovan |
| VoiceOver | Guidepup startar riktig VoiceOver och riktig Safari, läser komponenten punkt för punkt (VO-höger) och trycker samma tangenter som en användare. Allt VoiceOver säger loggas | Bara Mac | Cirka 30 s per story och sida |

Varje story öppnas med `?a11y-side=kb` och `?a11y-side=sj`, så att sidan bara innehåller den ena implementationen (plus det den lägger i `<body>`, som menyer och kalendrar). Parametern läses i `apps/storybook/.storybook/preview.tsx` och gör ingenting annars.

## Hur rapporten läses

- **Lika:** samma träd, samma fokus i varje tangentbordssteg och inga nya axe-fel.
- **Skiljer, troligen fel i sj-ui:** fokus hamnar på en annan sorts element (eller ingenstans), eller axe hittar ett fel som KB inte har.
- **Skiljer:** samma sorts element men annat namn eller tillstånd, eller en skillnad i trädet. Titta på raderna: `KB`-rader finns bara i KB, `sj`-rader bara i sj-ui.
- **Känd skillnad:** matchar en rad i `known-differences.json` (avsiktliga skillnader, se `docs/avsiktliga-skillnader.md`).

Trädet kommer från Playwrights egen beräkning (samma i alla motorer), inte från macOS. Det är därför VoiceOver-delen finns: den är facit för vad en Safari-användare hör.

## Val

```bash
npm run a11y -- Select DatePicker          # bara vissa komponenter
npm run a11y -- --story Standard           # bara stories vars namn innehåller ordet
npm run a11y -- --no-vo                    # bara de snabba kontrollerna
npm run a11y -- --vo-only                  # bara VoiceOver
npm run a11y -- --engines webkit,chromium  # fler motorer (standard: webkit)
npm run a11y -- --dark                     # mörkt läge
npm run a11y -- --url http://localhost:6006 --rebuild --workers 8
```

Storybook: en dev-server på port 6006 används om den kör. Annars byggs Storybook statiskt, och byggs om bara när sj-ui, stories eller Storybooks inställningar har ändrats.

## Lägga till och ändra

- **Tangentbordsflöden och VoiceOver-stories** per komponent: `scenarios.mjs`.
- **Kända skillnader:** `known-differences.json`, en lista med `{ "component": "Select", "match": "<regex som alla ändrade rader ska matcha>", "reason": "…" }`.
- **Ny komponent:** lägg den under `components` i `scenarios.mjs`. Stories hittas automatiskt under *Jämförelse/&lt;Komponent&gt;*.

## VoiceOver på Macen

- Kräver `npm run setup:mac` en gång. macOS frågar om behörigheter (Hjälpmedel, Automation av Safari och VoiceOver). Svara ja.
- Bara en VoiceOver-körning åt gången: sviten tar låset `/tmp/sj-voiceover.lock` och väntar om en annan körning har det.
- Safari används, inte Chrome: SJ testar VoiceOver i Safari.
- Datorn ska inte användas under körningen: VoiceOver och Safari tar fokus.

## Molnet

I Claudes moln finns Chromium förinstallerat. WebKit kräver `npx playwright install webkit` och `npx playwright install-deps webkit` (systembibliotek). VoiceOver går inte att köra där.

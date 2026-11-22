# Vad UI SDK gav i piloten

Kort svar: UI SDK tog hand om det svåraste och mest riskfyllda, beteendet och tillgängligheten i Select och DatePicker. Det hjälpte inte med det som tog mest tid, att få utseendet och KB:s egenheter exakt lika. Det arbetet hade krävts oavsett bibliotek.

## Vad sj-ui använder från UI SDK

| UI SDK-del | Används i | Vad den gör | Ungefärlig storlek i UI SDK |
|---|---|---|---|
| `select` | Select | Combobox och listbox enligt ARIA: tangentbord, sökning med bokstäver, flerval, aktiv rad, skärmläsartexter | 1 600 rader |
| `calendar` och `date-picker` | DatePicker | Dagrutnät med piltangenter, Page Up/Down, Home/End, min och max, styrd fokus | 2 300 rader |
| `popover` | Select, DatePicker | Översta lagret (`popover`), placering, fokusfälla, stäng med Escape och klick utanför | 300 rader |
| `field` | Select, DatePicker | Etikett, hjälptext och fel kopplade med rätt `id` och `aria-*` | 1 100 rader |
| `switch`, `button` | Switch, FlowButton | Roll, tillstånd och tangentbord | 250 rader |
| `core` | alla | Gemensam grund: händelser, fokus, datumfunktioner, SSR-säkra id:n | cirka 28 000 rader |
| `agent` | alla | Låter en AI-agent läsa och styra komponenterna | |

sj-ui:s egen kod är cirka 4 500 rader: 2 200 för det nya API:t och 2 400 för legacy-lagret som tar KB:s props.

## Vad det sparade

- **Tangentbord och skärmläsare i Select och DatePicker.** Det är där KB i dag förlitar sig på MUI, och där ett eget bygge brukar ta längst tid att få rätt. Beteendet fanns färdigt i UI SDK, enligt ARIA:s mönster. Det som återstod var att matcha KB:s val (till exempel att piltangenterna inte går runt i listan).
- **Lager och placering.** Popover i webbläsarens översta lager löser z-index och klippning utan portaler, och samma kod fungerar för meny på desktop och ark på mobil.
- **SSR.** Id:n och tillstånd är SSR-säkra från början. Hydreringstesterna gick igenom utan specialfall.
- **Storlek.** UI SDK är byggt utan stilmotor, så sj-ui blir 41 % mindre än KB för samma komponenter.

En grov uppskattning: utan UI SDK hade Select och DatePicker krävt 3 000–4 000 rader egen beteendekod till, och lika mycket testning med skärmläsare. Det är ungefär en fördubbling av piltens kod, och den del som är svårast att få rätt.

## Vad det inte sparade

- **Pixelparitet.** All CSS är skriven för hand mot KB:s tema. Det var den största delen av arbetet: att mäta, jämföra och rätta tills 612 av 616 jämförelser var identiska.
- **KB:s egenheter.** Maskad inmatning i datumfältet, att Enter och blur godkänner, mobilens skrivskyddade fält med bottenark, veckonummer, MUI:s regler för att jämföra värden. Allt det skrevs i legacy-lagret.
- **Legacy-props.** 295 KB-props, översatta till UI SDK:s API.
- **Enkla komponenter.** FlowButton, Switch och DepartureCard hade gått lika fort utan UI SDK.

## Risker

- UI SDK är i beta (0.1.0-beta.13). Lindring: låst version, sj-ui kapslar UI SDK så att inget team importerar det direkt, och Apache-2.0 tillåter en fork.
- Kräver React 19.
- Select läser "text" i stället för "markerad" i VoiceOver när listan öppnas. Felsökning pågår. Vi vet inte än om felet sitter i UI SDK eller i sj-ui.
- Fem av KB:s 192 komponenter. Nästlade komponenter (journey-summary, route-description) är inte provade.

## Vad som tog tid, och hur nästa komponenter går snabbare

Piloten tog ungefär sex timmar för fem komponenter. Cirka en fjärdedel gick till att bygga. Resten gick till att hitta skillnader mot KB, en i taget:

- **Skillnader hittades sent och för hand.** En skärmdump eller ett klick i taget, och KB:s egenheter (maskad inmatning, tidszonen i skärmläsartexten, tågnumret från `id`) upptäcktes först när något skilde sig.
- **VoiceOver i serie.** Varje fråga krävde en körning på Macen, med väntan mellan.
- **Mätverktygen byggdes under arbetets gång** i stället för före.

Processen för nästa komponenter:

1. **Generera testerna innan bygget.** Ett skript läser KB-komponentens `.d.ts` och stories och skapar jämförelsestories, prop-täckningen och pixeltester för varje variant i ljust och mörkt, desktop och mobil. Skärmläsartexten jämförs från tillgänglighetsträdet, ord för ord. Komponenten är klar när alla är gröna eller listade som avsiktliga skillnader.
2. **Läs KB:s källa först.** Skärmläsartexter, översättningar och hjälpfunktioner i KB:s `dist/` kopieras rakt av, så att egenheterna kommer med från början.
3. **Testsviten kör allt på några minuter** (`tools/a11y-harness`): tillgänglighetsträd i WebKit, tangentbordsflöden, axe och VoiceOver i Safari, med en rapport KB mot sj-ui.
4. **En komponent per tråd, parallellt.** Med testerna som facit kan flera komponenter byggas samtidigt utan att vänta på varandra.

Med det på plats bör en enkel komponent ta under en timme och en komplex (Select, DatePicker) några timmar, mest maskintid.

## Bedömning

UI SDK är värt att använda för de komplexa, interaktiva komponenterna (Select, DatePicker, Dialog, Menu, Autocomplete), där KB i dag behåller MUI för beteendets skull. För enkla komponenter ger det lite, och där räcker ren HTML och CSS med SJ:s tokens.

Siffrorna bakom bedömningen står i [matdata.md](matdata.md).

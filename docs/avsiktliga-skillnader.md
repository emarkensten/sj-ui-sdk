# Avsiktliga skillnader mot KB

Legacy-lagret ska ge samma utseende och beteende som KB med samma props. Här står de få ställen där sj-ui medvetet gör något annat. Alla gäller fel i KB som en team inte rimligen förlitar sig på.

## Select

| Vad | KB i dag | sj-ui | Varför |
|---|---|---|---|
| Egen `onOpen` eller `onClose` | Ersätter KB:s interna hanterare (`...other` sprids efter dem), så listan öppnas aldrig. | Anropar din hanterare och öppnar listan. | En Select som inte går att öppna är ett fel, inte ett beteende att bevara. |
| `displayEmpty` med tomt värde | Ramen öppnar plats för etiketten, men etiketten ligger kvar inne i fältet, ovanpå texten från `renderValue`. | Etiketten lyfts upp i ramen, som när ett värde är valt. | Två texter ovanpå varandra är ett fel i MUI:s etikettlogik. |
| `onChange` i mobilarket (under 600 px) | `event.target.value` är alltid en sträng, `event.target.name` saknas och andra argumentet (MenuItem) är `undefined`. Med `multiple` ersätts hela värdet av den tryckta raden. | Samma som på desktop: värdet har radens egen typ (till exempel en siffra), `name` finns och MenuItem skickas med. `multiple` fungerar likadant på mobil och desktop. | Kod som fungerar på desktop ska inte gå sönder på mobil. |

Allt annat i Select, även MUI:s regler för att jämföra värden (`2` och `"2"` räknas som samma), flervalets ordning (i klickordning) och att piltangenterna inte går runt, är som i KB. Se Storybook, *Jämförelse/Select*.

## DatePicker

| Vad | KB i dag | sj-ui | Varför |
|---|---|---|---|
| Knappen Klar (med `showActionButtons`) | Sparar datumet men låter kalendern stå öppen. Den stängs först med Escape eller ett klick utanför. | Sparar datumet och stänger kalendern. | En knapp som heter Klar och inte stänger något ser trasig ut. |
| `onAccept` vid ett klick i kalendern | Anropas två gånger med samma datum. | Anropas en gång. | Dubbla anrop ger dubbla sökningar eller loggrader hos teamen. |
| Föregående månad vid `minDate` eller `disablePast` | Går att bläddra till månaden före gränsen, där alla dagar är spärrade. | Pilen är spärrad i gränsmånaden. | En månad utan valbara dagar är en återvändsgränd. Felet kommer från MUI. |

Två fel i KB är kvar med flit, eftersom team kan ha byggt runt dem:

- `disabled` spärrar bara dagarna i kalendern. Fältet går fortfarande att skriva i och kalenderknappen går att trycka på.
- 41 props som KB:s typer ärver från TextField (till exempel `onBlur`, `onFocus`, `inputRef`, `error`, `name` och `InputProps`) läser KB aldrig. sj-ui tar emot dem så att koden kompilerar, och gör inte heller något med dem. Listan står som `KbIgnoredProp` i `packages/sj-ui/src/legacy/date-picker.tsx`. Prop-täckningen räknar dem som stödda.

Allt annat, även masken när man skriver (`2026-12-24`), att en ensiffrig dag får en nolla när fältet lämnas, mobilens skrivskyddade fält som öppnar ett ark, veckonumren och fokus i månads- och årsvyn, är som i KB. Se Storybook, *Jämförelse/DatePicker*.

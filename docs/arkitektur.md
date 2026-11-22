# Arkitektur

## Lager

```
0  Tokens     sj-global-styles.css (--sjse-*), vendrad oförändrad i src/vendor, i @layer sj-tokens
1  Beteende   @ui-sdk/core + @ui-sdk/react (fokus, tangentbord, popover/bottenark, kalender, ARIA)
2  sj-ui      src/components/*: React + en CSS-fil per komponent, nytt API
3  Legacy     src/legacy/*: KB:s namn, exporter och props, mappar till lager 2
4  Agent      src/agent: UI SDK:s agentbrygga med SJ:s regler (valfri import)
```

CSS-lagerordning: `@layer sj-tokens, sj-base, ui-sdk, sj-components;`. Tokens ligger i ett eget lager i stället för sj-global-styles `theme`, som krockar med Tailwind v4:s lager med samma namn.

## Principer

1. **Ett tokensystem.** Bara `--sjse-*` från sj-global-styles. Komponenternas egna variabler (`--accent-color`, `--sj-button-gap`) sätts från dem.
2. **Ingen stilmotor i runtime.** Komponenterna stylas på `data-slot` och data-attribut. Därför fungerar SSR, Node-streaming och hydrering utan stiltaggar eller flimmer (testat i `packages/sj-ui/test`).
3. **Nytt API följer redan fattade beslut.** Button har samma värden som Stencil-komponenten `sj-button` (`type`, `color`, `size`, `borderShape`, `icon`, `showSpinner`). Komplexa komponenter har en enkel variant som tar `items`, och UI SDK:s parts finns kvar för vyer som behöver mer.
4. **Beteendelagret kapslas.** Inga UI SDK-typer i sj-ui:s publika props (utom parts). Ett byte till React Aria eller Base UI blir lokalt.
5. **Legacy är riktiga filer.** Varje legacy-komponent är en egen `.tsx` med default- och named export (Lovable räknar inte re-exports). Props som inte stöds loggar en varning i utveckling, de ignoreras inte tyst.
6. **Allt interaktivt är UI SDK-delar** så att agentbryggan ser det. DepartureCard är en knapp med `aria-pressed`, som i KB.

## Legacy-lagret

| KB | Hur |
|---|---|
| `onChange(event, checked)`, `event.target.value` | Syntetiskt event (`lib/events.ts`) |
| `MenuItem`-barn i `Select` | Läses som options. `value=""` blir platshållare |
| `customAttribute` | Attribut på roten |
| `isLoading` | Skelett |
| `lang`, `translation` | `lang` stöds, `customTranslation` varnar |
| `sx` | Spacing (`m`, `p`, `gap`, ×8 px) och layout stöds. Resten varnar, eller går till RFC:ns `useSjSx` via `LegacySxProvider resolver={useSjSx}` |
| `DepartureCard disabled` | Stoppar klicket (KB:s bugg: når inte kortets knapp) |
| `id` på Select och DatePicker | Saknas än: hamnar på en omslutande `div`, inte på kontrollen. `label htmlFor` och `#id` i tester hittar alltså inte fältet |

## Mörkt läge

KB byter läge med MUI:s `ThemeProvider`. sj-ui har ingen provider: färgerna följer `color-scheme` (tokens med `light-dark()`), och skuggor och tågbildernas dämpning följer systemet eller `data-color-scheme="dark"` på `<html>`. CSS kan inte läsa vilket läge som används, så en app som tvingar mörkt läge ska sätta båda: `document.documentElement.style.colorScheme = "dark"` och `document.documentElement.dataset.colorScheme = "dark"`, som Storybook gör. Sätter appen bara `color-scheme` blir färgerna rätt men tågbilderna odämpade.

## Token-drift

`sj-button` 1.1.0 refererar tokens som `sj-global-styles` 3.1.0 saknar: `--sjse-color-fill-svart-8-procent` och `--sjse-color-background-base-secondary`. CSS:en har fallbacks. sj-global-styles läser också `--sjse-base-value` och `--sjse-font-family` utan att definiera dem (KB:s MUI-tema sätter dem i runtime), så `base.css` sätter `16` och `"sj_sans"`. Hover och pressed räknas med `--sjse-opacity-hovered/pressed` (0,08/0,12) som ett lager ovanpå färgen, inte med MUI:s `darken/lighten`, och kan skilja sig lite i mörkt läge.

## Bedömning mot RFC:n

**Det jag tror på:** UI SDK som beteendelager under nästa major av KB:s komponenter, framför allt de komplexa (Select, DatePicker, Dialog, Menu) där RFC:n tänker behålla MUI. Det är där tillgänglighetsarbetet sitter, och där en stilmotor inte hjälper. Med CSS per komponent behövs stilmotorn bara för `sx` i legacy. Samma beteende finns för Web Components, vilket kan förena Stencil- och React-spåren.

**Siffror (samma fem komponenter, gzip, utan React):** KB 303 kB JS (194 kB utan tågbilder), sj-ui 166 kB JS (104 kB utan tågbilder) + 12 kB CSS. Allt uppmätt står i [matdata.md](matdata.md).

**Risker:**
- Beta (0.1.0-beta.13) och tredjepartsberoende, samma invändning som RFC:n har mot Base UI. Lindring: låst version, kapsling (princip 4), Apache-2.0 tillåter fork.
- Kräver React 19.
- Skärmläsare: DatePicker läser som KB i VoiceOver/Safari. Select säger "text" i stället för "markerad" när listan öppnas (felsöks). TalkBack och NVDA är inte provade.
- Fem av 192 komponenter. Nästlade komponenter (route-description, journey-summary, data-grid) är inte provade, och det var där Lovable-försöket gick sönder.

**Nästa steg om teamet vill gå vidare:** rätta Selects VoiceOver-text, en nästlad komponent (journey-summary), paritet i högkontrast och forced colors, och TalkBack och NVDA.

# KB:s beroenden (insamlat 2026-11-22)

Källa: Bit GraphQL `listComponents` för scope `sj-ab.component-library` (192 komponenter) och `package.json` för senaste version från node-registry.bit.cloud.

## Översikt

- 192 paket: 140 ui, 14 utils, 10 props, 9 styles, 9 translations, 4 internal, 3 envs, 2 hooks, 1 assets.
- 136 av 192 beror på `@mui/material` (peer `^7.3.5`). 6 på `@mui/x-date-pickers`, 14 på `date-fns`, 8 på `@date-fns/tz`.
- Alla 579 interna beroenden är exakt pinnade. Prototypmallen får 144 kopior av 94 unika SJ-paket i `node_modules` (ikoner 5 kopior, typography 4, localization-util 6). Versionsskillnaderna är strukturella, inte slarv.

## Mest använda (direkta dependents)

ui.typography 54, ui.icons 45, styles.utils 34, ui.badge 22, translations.translation-types 20, ui.card 17, props.border-radius-props 16, ui.icon-button 16, props.density-props 14, ui.divider 14.

## Tyngst (transitiva SJ-paket)

data-grid 48, route-description och journey-card 37, journey-summary 36, departure-card 34, autocomplete 33, select 24, date-picker 24.
date-picker drar in bottom-sheet → app-bar → action-buttons → flow-button. select drar in menu → bottom-sheet → app-bar.

## Tvärgående legacy-props

`customAttribute`, `lang`, `translation`/`customTranslation`, `isLoading`, `negativeMargins`, BorderRadiusProps, DensityProps, `sx` och MUI-props via arv (ButtonBase, Select, MenuItem, FormControlLabel, TextField). Exporterna är blandade: AppBar och Typography default, FlowButton och Switch named, de flesta båda.

## Följd för sj-ui

Ett platt bibliotek med relativa imports och en version för helheten tar bort pin-problemet. Ordningen för att porta följer grafen: bladkomponenter (typography, icons, badge, divider) först, sedan det som öppnar andra (bottom-sheet före select och date-picker).

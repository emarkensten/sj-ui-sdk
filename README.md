# sj-ui-sdk

Pilot: fem av SJ:s komponenter (FlowButton, Switch, Select, DatePicker, DepartureCard) utan MUI, med beteendet från [UI SDK](https://ui-sdk.dev) (Apache-2.0) och utseendet från SJ:s egna tokens (`sj-global-styles`) och ren CSS. Ett legacy-lager tar KB:s props rakt av, så ett team kan byta import och få samma beteende och utseende. Underlag till designsystemteamets RFC "Nästa iteration av komponentbiblioteket".

**Storybook, KB och sj-ui sida vid sida:** https://sj-ui-sdk-storybook.vercel.app

## Bedömning

Gå vidare med UI SDK för de komplexa komponenterna (Select, DatePicker, Dialog, Menu), där KB i dag behåller MUI för beteendets skull. För enkla komponenter räcker ren HTML och CSS med SJ:s tokens.

| | KB | sj-ui |
|---|---|---|
| Paketstorlek, alla fem, gzip | 303 kB | 178 kB (41 % mindre) |
| Pixelidentiska jämförelser, ljust och mörkt, desktop och mobil | | PARITETTOTAL |
| KB-props som fungerar oförändrade | | 295 av 295 |

Kvar: Select läser "text" i stället för "markerad" i VoiceOver när listan öppnas, och nästlade komponenter är inte provade. Allt uppmätt står i [docs/matdata.md](docs/matdata.md), vad UI SDK gav i [docs/ui-sdk-rapport.md](docs/ui-sdk-rapport.md) och avsiktliga skillnader mot KB i [docs/avsiktliga-skillnader.md](docs/avsiktliga-skillnader.md).

Repot är privat. SJ:s tokens och ikoner ligger vendrade här och får inte publiceras som paket utan SJ:s beslut (`SEE LICENSE IN UNLICENSED`).

## Mappar

| Mapp | Vad |
|---|---|
| `packages/sj-ui/` | Biblioteket. `src/components/` nytt API, `src/legacy/` KB:s props, `src/agent/` agentbryggan, `test/` SSR, hydrering och agent |
| `apps/storybook/` | KB och sj-ui sida vid sida, klickbara, med samma props. Börja här |
| `apps/demo/` | En sökvy med nya API:t, och `wc.html` med samma komponenter som Web Components |
| `docs/` | `matdata.md` (allt uppmätt), `ui-sdk-rapport.md`, `avsiktliga-skillnader.md`, `prop-coverage.md`, `arkitektur.md` (lager, principer, bedömning) och `beroendekarta.md` (KB:s beroenden) |
| `lovable/` | Hur komponenterna förs in i Lovable som källkod |

## Kom igång

```bash
npm install
npm test                 # SSR, streaming, hydrering, agentbrygga
npm run typecheck
npm run dev              # demo på http://localhost:5180

cd apps/storybook        # eget npm-projekt: KB-paketen kommer från Bit
npm install
npm run storybook        # http://localhost:6006
npm run size             # storlek KB mot sj-ui för samma komponenter
```

`npm run sync` i `packages/sj-ui` hämtar om tokens och ikoner från ett projekt där KB är installerat.

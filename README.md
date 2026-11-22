# sj-ui-sdk

Pilot: SJ:s komponenter utan MUI, med beteendet från [UI SDK](https://ui-sdk.dev) (Apache-2.0) och utseendet från SJ:s egna tokens (`sj-global-styles`) och ren CSS. Underlag till designsystemteamets RFC "Nästa iteration av komponentbiblioteket".

Repot är privat. SJ:s tokens och ikoner ligger vendrade här och får inte publiceras utan SJ:s beslut (`SEE LICENSE IN UNLICENSED`).

## Mappar

| Mapp | Vad |
|---|---|
| `packages/sj-ui/` | Biblioteket. `src/components/` nytt API, `src/legacy/` KB:s props, `src/agent/` agentbryggan, `test/` SSR, hydrering och agent |
| `apps/storybook/` | KB och sj-ui sida vid sida, klickbara, med samma props. Börja här |
| `apps/demo/` | En sökvy med nya API:t, och `wc.html` med samma komponenter som Web Components |
| `docs/` | `arkitektur.md` (lager, principer, token-drift, bedömning) och `beroendekarta.md` (KB:s beroenden) |
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

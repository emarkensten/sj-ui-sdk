# sj-ui i Lovable

Inte provat i Lovable än. Upplägget bygger på lärdomarna från det tidigare shadcn-försöket.

## Varför det bör fungera

- SJ saknar Lovable Enterprise, så privata npm-paket (Bit) går inte. sj-ui levereras som källkod, och det enda npm-beroendet, `@ui-sdk/react` och `@ui-sdk/core`, ligger öppet på npm.
- Varje komponent är en riktig `.tsx`, inga re-exports (Lovable visar bara lokalt skrivna komponenter).
- Inget rör `window` på modulnivå, så TanStack Starts SSR klarar det (testat med renderToString och streaming).
- Tokens ligger i `@layer sj-tokens`, inte `theme`, så de krockar inte med Tailwind v4.
- Kräver React 19, som Lovables mall har (19.2).

## Steg

1. Kopiera `packages/sj-ui/src` till Lovable-projektets designsystem-mapp (eller `src/sj-ui`).
2. Lägg till `@ui-sdk/core` och `@ui-sdk/react`, version `0.1.0-beta.13` exakt.
3. Lägg `system.md` (här bredvid) som `.lovable/system.md`. Raden om CSS-importen måste stå först.
4. Kontrollera efter release: lista filerna i Lovable och jämför med den lokala listan. Lita inte på git.

## Inte här än

En `.md` per komponent för Lovables regler (inte `components.md`, som skrivs över vid release). Görs när teamet bestämt sig för piloten.

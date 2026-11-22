# SJ:s designsystem (sj-ui)

**Först, annars blir allt fel i tysthet:** importera `styles.css` från sj-ui-mappen överst i `src/styles.css`, till exempel `@import "./design-system/<slug>/styles.css";`. Mappens namn har ett slumpat suffix: titta i `src/design-system/`. Kontroll: en `<Button>` ska ha bakgrunden `rgb(0, 171, 59)` i ljust läge.

## Regler

- Använd bara komponenterna i sj-ui-mappen. Bygg ingen egen knapp, switch, lista eller kalender.
- Props står i komponentens `.tsx`. Gissa inte, och använd inte MUI:s eller shadcn:s propnamn.
- Färger, avstånd och typsnitt kommer från `--sjse-*`-variabler. Inga hex-värden, och skriv inte över Tailwinds `--spacing`.
- Typografi: `<Typography variant="title2Emphasized" as="h2">`. Rubriknivån sätts med `as`.
- Knappar: `type` (filled, tinted, outlined, gray, plain) och `color` (lov, himmel2, himmel, gras, varning, raps). En filled-knapp per vy.
- Datum är ISO-strängar (`"2026-11-24"`). Inget datumbibliotek behövs.
- Texter på svenska, du-form, korta och konkreta.

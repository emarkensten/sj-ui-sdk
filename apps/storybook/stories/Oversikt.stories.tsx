import type { Meta, StoryObj } from "@storybook/react-vite";

/*
 * The landing page for the DS team: what the pilot is, how it maps to the RFC
 * "Nästa iteration av komponentbiblioteket", and what is not proven yet.
 * Sizes come from `npm run size` in this folder.
 */

const rows: [string, string, string][] = [
  ["Funktionellt", "Komponenterna ser ut och beter sig som KB, i ljust och mörkt läge.", "Fem komponenter sida vid sida under Jämförelse. Tangentbord, fokus och bottenark på mobil kommer från UI SDK. Ingen skärmläsare provad än."],
  ["Arkitektur: SSR och streaming", "Komponenterna ska fungera med Node-streaming och hydrering utan stilflimmer.", "Ingen stilmotor i runtime: en CSS-fil per komponent i @layer. Test för renderToString, renderToPipeableStream och hydrering utan varningar går igenom (packages/sj-ui/test)."],
  ["Arkitektur: beroenden", "Bort från MUI. Färre och lösare beroenden mellan paketen.", "Inga MUI-, Emotion- eller datumbibliotek. Ett beroende: @ui-sdk (Apache-2.0). Tokens är sj-global-styles som den är, inga nya namn."],
  ["DX", "Enkelt att använda och att bygga nya komponenter.", "Nytt API följer sj-button (type, color, size). Komplexa delar finns som parts (SelectTrigger, CalendarGrid) när en vy behöver mer än standardvarianten."],
  ["Migrering", "Komponent för komponent, API nära dagens.", "Legacy-lagret tar KB:s props (onChange(event, checked), MenuItem-barn, ISO-datum). Samma kod renderar båda sidorna i Jämförelse. sx stöds för spacing och layout, och resten kan gå till er useSjSx via LegacySxProvider."],
];

function Overview() {
  return (
    <article className="overview">
      <h1>SJ UI på UI SDK: pilot</h1>
      <p className="overview__lead">
        Fem av SJ:s komponenter byggda om utan MUI: beteendet från UI SDK (Vercel, Apache-2.0), utseendet från SJ:s egna
        tokens i sj-global-styles och ren CSS. Ett legacy-lager tar samma props som KB, så att en vy kan byta utan att
        skrivas om.
      </p>

      <h2>Mot RFC:ns kriterier</h2>
      <table>
        <thead>
          <tr><th>Kriterium</th><th>RFC:n vill</th><th>Det här visar piloten</th></tr>
        </thead>
        <tbody>
          {rows.map(([a, b, c]) => (
            <tr key={a}><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Storlek för samma fem komponenter</h2>
      <p>Minifierat och gzippat, React räknas inte. Mät själv med <code>npm run size</code>.</p>
      <table>
        <thead>
          <tr><th></th><th>JS gzip</th><th>CSS gzip</th><th>Största delar</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">KB i dag</th><td>303 kB</td><td>1 kB</td><td>tågbilder 672 kB, MUI 239 kB, MUI X 55 kB, date-fns 53 kB (minifierat)</td></tr>
          <tr><th scope="row">KB utan tågbilder</th><td>194 kB</td><td>1 kB</td><td>MUI, MUI X, date-fns, tokens i JS</td></tr>
          <tr><th scope="row">sj-ui</th><td>93 kB</td><td>7 kB</td><td>@ui-sdk/core 209 kB minifierat, mest kalender och lista</td></tr>
        </tbody>
      </table>
      <p className="overview__note">sj-ui:s CSS innehåller sj-global-styles (21 kB okomprimerat), som KB-appar också laddar men separat.</p>

      <h2>Hur UI SDK passar i RFC:n</h2>
      <ul>
        <li><strong>Där RFC:n vill behålla MUI</strong> (komplexa komponenter som Select och DatePicker) kan UI SDK ta beteendet i stället. Det är där det mesta av arbetet och tillgängligheten sitter.</li>
        <li><strong>Stilmotorn behövs bara för sx.</strong> Nya komponenter stylas med CSS på data-attribut. useSjSx kan leva kvar för legacy-props.</li>
        <li><strong>Samma beteende i React och Web Components.</strong> UI SDK har adaptrar för båda med samma CSS-klasser, vilket kan förena Stencil-spåret och React-spåret. Se apps/demo/wc.html.</li>
        <li><strong>Agenter ser komponenterna.</strong> UI SDK:s agentbrygga kan läsa och använda allt som byggs på dess delar.</li>
      </ul>

      <h2>Det som inte är bevisat än</h2>
      <ul>
        <li>UI SDK är beta (0.1.0-beta.13) och ett tredjepartsberoende, samma invändning som RFC:n har mot Base UI. Lindring: låst version, ingen UI SDK-typ i det publika API:t, och licensen tillåter en egen fork.</li>
        <li>Kräver React 19.</li>
        <li>Ingen granskning med VoiceOver, TalkBack eller NVDA. Bara tangentbord och tillgänglighetsträd.</li>
        <li>Tågbilden i DepartureCard är en ikon, och FlowButtons färger orange, svart, vit och frostad är ungefärliga.</li>
        <li>Fem komponenter av 192. Det svåra mönstret (nästlade komponenter som route-description och data-grid) är inte provat.</li>
      </ul>
    </article>
  );
}

const meta: Meta = { title: "Översikt", parameters: { layout: "padded" } };
export default meta;
export const Pilot: StoryObj = { name: "Pilot och RFC", render: () => <Overview /> };

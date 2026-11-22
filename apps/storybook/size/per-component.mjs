/*
 * Bundle size: each component bundled as an app would (React external), minified, gzipped.
 *   node size/per-component.mjs   (totals and largest packages: npm run size)
 */
// Bundles each component the way an app would (react, react-dom external), minified, and reports gzip size.
import { build } from "esbuild"; import { gzipSync } from "node:zlib"; import path from "node:path";
const sb = path.resolve(import.meta.dirname, "..");
const sj = path.resolve(sb, "../../packages/sj-ui/src/legacy");
const cases = {
  FlowButton: ['import { FlowButton } from "@sj-ab/component-library.ui.flow-button"; export default FlowButton;', `import { FlowButton } from "${sj}/flow-button.tsx"; export default FlowButton;`],
  Switch: ['import { Switch } from "@sj-ab/component-library.ui.switch"; export default Switch;', `import { Switch } from "${sj}/switch.tsx"; export default Switch;`],
  Select: ['import Select from "@sj-ab/component-library.ui.select"; import MenuItem from "@sj-ab/component-library.ui.menu-item"; export default [Select, MenuItem];', `import { Select } from "${sj}/select.tsx"; import { MenuItem } from "${sj}/menu-item.tsx"; export default [Select, MenuItem];`],
  DatePicker: ['import { DatePicker } from "@sj-ab/component-library.ui.date-picker"; export default DatePicker;', `import { DatePicker } from "${sj}/date-picker.tsx"; export default DatePicker;`],
  DepartureCard: ['import DepartureCard from "@sj-ab/component-library.ui.departure-card"; export default DepartureCard;', `import { DepartureCard } from "${sj}/departure-card.tsx"; export default DepartureCard;`],
  "Alla fem": [null, null],
};
cases["Alla fem"] = [Object.values(cases).slice(0, 5).map((c, i) => c[0].replace(/export default (.*);/, `export const c${i} = $1;`)).join("\n"), Object.values(cases).slice(0, 5).map((c, i) => c[1].replace(/export default (.*);/, `export const c${i} = $1;`)).join("\n")];
const size = async (code) => {
  const r = await build({ stdin: { contents: code, resolveDir: sb, loader: "tsx" }, bundle: true, minify: true, write: false, format: "esm", platform: "browser", external: ["react", "react-dom", "react/jsx-runtime"], loader: { ".css": "css", ".svg": "dataurl", ".png": "dataurl", ".woff2": "dataurl", ".webp": "dataurl" }, outdir: "/tmp/out", jsx: "automatic", logLevel: "silent", define: { "process.env.NODE_ENV": '"production"' } });
  let js = 0, css = 0; for (const f of r.outputFiles) { const g = gzipSync(f.contents).length; if (f.path.endsWith(".css")) css += g; else js += g; } return { js, css };
};
const kb = (n) => (n / 1024).toFixed(1);
console.log("| Komponent | KB, JS gzip | sj-ui, JS gzip |\n|---|---|---|");
for (const [name, [a, b]] of Object.entries(cases)) {
  try { const A = await size(a), B = await size(b); console.log(`| ${name} | ${kb(A.js)} kB | ${kb(B.js)} kB |`); } catch (e) { console.log(name, "ERR", String(e.message).slice(0, 300)); }
}
// sj-ui's CSS ships once for all components: tokens, base, components and the legacy layer. KB's CSS is in its JS (Emotion).
const ui = path.resolve(sb, "../../packages/sj-ui/src");
const css = await size(`import "${ui}/styles.css"; import "${ui}/legacy/legacy.css";`);
console.log(`\nsj-ui CSS (styles.css + legacy.css), gzip: ${kb(css.css)} kB`);

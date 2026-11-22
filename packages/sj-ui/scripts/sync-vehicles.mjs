// Copies SJ's vehicle illustrations (ui.trains and ui.transport-image on Bit) into
// src/components/departure-card/vehicles as plain .svg files. KB inlines them as base64
// in JavaScript (about 690 kB); as asset imports, the bundler only ships the URL and the browser
// fetches the one picture a card shows.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const roots = [process.env.SJ_KB, join(here, ".."), join(here, "../../.."), join(here, "../../../apps/storybook"), join(here, "../../../../sj-design-code-template")].filter(Boolean);
const find = (pkg) => roots.map((r) => join(r, "node_modules/@sj-ab", pkg)).find((p) => existsSync(join(p, "dist")));
const trains = find("component-library.ui.trains");
const other = find("component-library.ui.transport-image");
if (!trains || !other) {
  console.error("Hittar inte ui.trains och ui.transport-image. Sätt SJ_KB till en mapp där paketen är installerade.");
  process.exit(1);
}
const out = join(here, "../src/components/departure-card/vehicles");
mkdirSync(out, { recursive: true });
const dirs = [join(trains, "dist/internal/VehicleImages"), join(other, "dist/internal/VehicleImages")];
const names = [];
for (const dir of dirs) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const src = readFileSync(join(dir, file), "utf8");
    const b64 = src.match(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/)?.[1];
    if (!b64) throw new Error(`Ingen svg i ${file}`);
    const name = file.replace(/\.js$/, "");
    writeFileSync(join(out, `${name}.svg`), Buffer.from(b64, "base64"));
    names.push(name);
  }
}
const version = (p) => JSON.parse(readFileSync(join(p, "package.json"), "utf8")).version;
let ts = `/* Generated from @sj-ab/component-library.ui.trains@${version(trains)} and ui.transport-image@${version(other)} by scripts/sync-vehicles.mjs. Do not edit. */\n`;
ts += `/* Plain asset imports: Vite gives the same URL on the server and in the browser, so SSR hydrates cleanly. */\n`;
ts += names.map((n) => `import ${n} from "./vehicles/${n}.svg";`).join("\n") + "\n\n";
ts += `export const vehicleUrls = { ${names.join(", ")} };\n`;
ts += `export type VehicleName = keyof typeof vehicleUrls;\n`;
writeFileSync(join(here, "../src/components/departure-card/vehicle-urls.ts"), ts);
console.log(`${names.length} fordonsbilder -> src/components/departure-card/vehicles`);

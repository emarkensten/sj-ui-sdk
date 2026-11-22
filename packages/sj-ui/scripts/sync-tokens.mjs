// Copies SJ's token CSS (styles.sj-global-styles) from Bit into src/vendor, unchanged
// except for a header. Run with SJ_KB=<folder with node_modules/@sj-ab> or from a project
// that has the package installed. Never edit the vendored file by hand: put overrides in
// src/styles.css instead, so the next sync doesn't drop them.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const roots = [process.env.SJ_KB, join(here, ".."), join(here, "../../.."), join(here, "../../../../sj-design-code-template")].filter(Boolean);
const pkgDir = roots
  .map((r) => join(r, "node_modules/@sj-ab/component-library.styles.sj-global-styles"))
  .find((p) => existsSync(join(p, "dist/sj-global-styles.css")));

if (!pkgDir) {
  console.error("Hittar inte @sj-ab/component-library.styles.sj-global-styles. Sätt SJ_KB till en mapp där paketet är installerat.");
  process.exit(1);
}

const { version } = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
const css = readFileSync(join(pkgDir, "dist/sj-global-styles.css"), "utf8");
const header = `/* Vendored from @sj-ab/component-library.styles.sj-global-styles@${version}. Do not edit: run \`npm run sync\`. */\n`;
const out = join(here, "../src/vendor/sj-global-styles.css");
writeFileSync(out, header + css);
writeFileSync(join(here, "../src/vendor/VERSION.json"), JSON.stringify({ "styles.sj-global-styles": version }, null, 2) + "\n");
console.log(`sj-global-styles ${version} -> src/vendor/sj-global-styles.css`);

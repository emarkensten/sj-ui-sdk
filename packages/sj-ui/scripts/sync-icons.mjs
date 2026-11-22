// Generates src/icons/index.tsx from SJ's icon package (ui.icons) on Bit. Only the icons
// listed in icons.json are emitted, so the copy that goes into Lovable stays small.
// Add a name to icons.json and run `npm run sync` to get another icon.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const roots = [process.env.SJ_KB, join(here, ".."), join(here, "../../.."), join(here, "../../../../sj-design-code-template")].filter(Boolean);
const pkgDir = roots
  .map((r) => join(r, "node_modules/@sj-ab/component-library.ui.icons"))
  .find((p) => existsSync(join(p, "dist")));
if (!pkgDir) {
  console.error("Hittar inte @sj-ab/component-library.ui.icons. Sätt SJ_KB till en mapp där paketet är installerat.");
  process.exit(1);
}
const { version } = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
const names = JSON.parse(readFileSync(join(here, "../src/icons/icons.json"), "utf8"));

const attr = (src, name) => src.match(new RegExp(`${name}: "([^"]+)"`))?.[1];
let out = `/* Generated from @sj-ab/component-library.ui.icons@${version} by scripts/sync-icons.mjs. Do not edit. */\nimport type { SVGProps } from "react";\n\nexport type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };\n\nfunction svg(paths: string, viewBox: string) {\n  return function Icon({ size = "1.5rem", ...props }: IconProps) {\n    return (\n      <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width={size} height={size} focusable="false" aria-hidden="true" {...props} dangerouslySetInnerHTML={{ __html: paths }} />\n    );\n  };\n}\n\n`;
for (const name of names) {
  const file = join(pkgDir, "dist", `${name}.js`);
  if (!existsSync(file)) throw new Error(`Ikonen ${name} finns inte i ui.icons@${version}`);
  const src = readFileSync(file, "utf8");
  const viewBox = attr(src, "viewBox") ?? "0 0 24 24";
  const paths = [...src.matchAll(/React\.createElement\("path", \{([^}]*)\}\)/g)].map(([, body]) => {
    const d = attr(body, "d");
    const rule = attr(body, "fillRule");
    return `<path fill="currentColor"${rule ? ` fill-rule="${rule}" clip-rule="${rule}"` : ""} d="${d}"/>`;
  });
  if (!paths.length) throw new Error(`Hittade inga paths i ${name}`);
  out += `export const ${name} = svg(${JSON.stringify(paths.join(""))}, ${JSON.stringify(viewBox)});\n`;
}
writeFileSync(join(here, "../src/icons/index.tsx"), out);
console.log(`${names.length} ikoner från ui.icons ${version} -> src/icons/index.tsx`);

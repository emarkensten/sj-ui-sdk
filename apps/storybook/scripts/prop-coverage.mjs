/*
 * Prop coverage: every prop KB's components accept must be accepted by the legacy component,
 * with a type that takes KB's values. The TypeScript compiler lists the props, not a person.
 * A prop that is neither supported nor listed in prop-differences.json fails the run.
 *
 *   node scripts/prop-coverage.mjs          report and exit 1 on gaps
 *   node scripts/prop-coverage.mjs --write  also write docs/prop-coverage.md
 */
import ts from "typescript";
import path from "node:path";
import fs from "node:fs";

const root = path.resolve(import.meta.dirname, "..");
const repo = path.resolve(root, "../..");
const components = {
  FlowButton: ["flow-button", "{ FlowButton }"],
  Switch: ["switch", "{ Switch }"],
  FormControlLabel: ["form-control-label", "{ FormControlLabel }"],
  Select: ["select", "{ Select }"],
  MenuItem: ["menu-item", "{ MenuItem }"],
  DatePicker: ["date-picker", "{ DatePicker }"],
  DepartureCard: ["departure-card", "default"],
};
const differences = JSON.parse(fs.readFileSync(path.join(root, "scripts/prop-differences.json"), "utf8"));

const lines = ['import type { ComponentProps } from "react";'];
for (const [name, [pkg, imp]] of Object.entries(components)) {
  const local = imp === "default" ? name : `{ ${name} }`;
  lines.push(`import ${local === name ? `Kb${name}` : `{ ${name} as Kb${name} }`} from "@sj-ab/component-library.ui.${pkg}";`);
  lines.push(`import ${local === name ? `Sj${name}` : `{ ${name} as Sj${name} }`} from "@sj-ui-sdk/sj-ui/legacy/${pkg}";`);
  lines.push(`export type Kb_${name} = ComponentProps<typeof Kb${name}>;`, `export type Sj_${name} = ComponentProps<typeof Sj${name}>;`);
}
const file = path.join(root, "scripts/.prop-coverage.tsx");
fs.writeFileSync(file, lines.join("\n") + "\n");

const cfg = ts.getParsedCommandLineOfConfigFile(path.join(root, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const program = ts.createProgram([file], cfg.options);
const checker = program.getTypeChecker();
const exports = new Map(checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(file))).map((s) => [s.name, checker.getDeclaredTypeOfSymbol(s)]));
fs.unlinkSync(file);

const origin = (p) => {
  const f = p.declarations?.[0]?.getSourceFile().fileName ?? "";
  const m = f.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1];
  return m?.startsWith("@sj-ab") ? "KB" : m === "@types/react" ? "HTML" : m ?? "KB";
};

let gaps = 0;
const report = ["# Prop-täckning mot KB", "", "Genererad av `apps/storybook/scripts/prop-coverage.mjs` från KB:s och sj-ui:s typer. Kör om efter varje ändring.", ""];
const summary = ["| Komponent | KB:s egna och MUI:s props | HTML-attribut | Medvetna skillnader | Saknas |", "|---|---|---|---|---|"];
const detail = [];
for (const name of Object.keys(components)) {
  const kb = exports.get(`Kb_${name}`), sj = exports.get(`Sj_${name}`);
  const diff = differences[name] ?? {};
  const rows = { ok: 0, html: 0, htmlTotal: 0, deliberate: [], missing: [] };
  for (const p of checker.getPropertiesOfType(kb)) {
    const from = origin(p);
    const target = sj.getProperty(p.name);
    const kbType = checker.getNonNullableType(checker.getTypeOfSymbol(p));
    const ok = target && checker.isTypeAssignableTo(kbType, checker.getTypeOfSymbol(target));
    if (from === "HTML") rows.htmlTotal++;
    if (ok) { from === "HTML" ? rows.html++ : rows.ok++; continue; }
    if (diff[p.name]) { rows.deliberate.push([p.name, diff[p.name]]); continue; }
    const why = target ? `typen skiljer: KB \`${checker.typeToString(kbType).slice(0, 120)}\`, sj-ui \`${checker.typeToString(checker.getTypeOfSymbol(target)).slice(0, 120)}\`` : "finns inte";
    rows.missing.push([p.name, from, why]);
  }
  gaps += rows.missing.length;
  const kbCount = rows.ok + rows.deliberate.length + rows.missing.filter((m) => m[1] !== "HTML").length;
  summary.push(`| ${name} | ${rows.ok} av ${kbCount} | ${rows.html} av ${rows.htmlTotal} | ${rows.deliberate.length} | ${rows.missing.length} |`);
  detail.push(`## ${name}`, "");
  if (rows.deliberate.length) detail.push("**Medvetna skillnader**", "", ...rows.deliberate.map(([p, r]) => `- \`${p}\`: ${r}`), "");
  if (rows.missing.length) detail.push("**Saknas**", "", ...rows.missing.map(([p, f, w]) => `- \`${p}\` (${f}): ${w}`), "");
  if (!rows.deliberate.length && !rows.missing.length) detail.push("Alla props stöds.", "");
}
report.push(...summary, "", ...detail);
const text = report.join("\n");
if (process.argv.includes("--write")) fs.writeFileSync(path.join(repo, "docs/prop-coverage.md"), text);
console.log(text);
if (gaps) { console.error(`\n${gaps} props saknas eller har fel typ.`); process.exit(1); }

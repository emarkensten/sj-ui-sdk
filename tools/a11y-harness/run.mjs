#!/usr/bin/env node
/*
 * One command for the whole accessibility comparison of KB and sj-ui:
 *
 *   npm run a11y                       everything: fast checks, and VoiceOver in Safari on a Mac
 *   npm run a11y -- --no-vo            only the fast checks (seconds to minutes, any OS, CI)
 *   npm run a11y -- --vo-only          only VoiceOver
 *   npm run a11y -- Select DatePicker  only these components
 *   npm run a11y -- --story Standard   only stories whose name contains this
 *   npm run a11y -- --engines webkit,chromium --dark --url http://localhost:6006 --rebuild
 *
 * The report lands in tools/a11y-harness/report/ (index.html, RAPPORT.md, results.json).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { components, viewports } from "./scenarios.mjs";
import { storybook, comparisonStories, sameName } from "./lib/storybook.mjs";
import { checkSide } from "./lib/fast.mjs";
import { compareFast, compareVo, html, markdown, loadKnown } from "./lib/report.mjs";
import { launch } from "./lib/browsers.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const valued = new Set(["story", "engines", "url", "workers"]);
const only = argv.filter((a, i) => !a.startsWith("--") && !valued.has(argv[i - 1]?.slice(2)));
const isMac = process.platform === "darwin";
const doVo = !flag("no-vo") && (flag("vo-only") || isMac);
const doFast = !flag("vo-only");
const scheme = flag("dark") ? "dark" : "light";
const storyFilter = opt("story")?.toLowerCase();
const workers = Number(opt("workers") ?? Math.max(2, Math.min(8, (await import("node:os")).availableParallelism())));
const log = (...a) => console.log(...a);
const t0 = Date.now();

const sb = await storybook({ url: opt("url"), rebuild: flag("rebuild"), log });
const all = await comparisonStories(sb.base);
const names = Object.keys(components).filter((c) => all[c] && (!only.length || only.some((o) => sameName(o, c))));
if (!names.length) {
  console.error(`Hittade inga komponenter. Finns: ${Object.keys(all).join(", ")}`);
  process.exit(1);
}

const notChecked = [];
let fast = [];
let engines = [];
if (doFast) {
  const wanted = (opt("engines") ?? "webkit").split(",");
  const browsers = await launch(wanted, log);
  engines = Object.keys(browsers);
  for (const e of wanted) if (!browsers[e]) notChecked.push(`${e} (gick inte att starta)`);

  const jobs = [];
  for (const c of names) {
    const conf = components[c];
    const stories = all[c].filter((s) => !storyFilter || s.name.toLowerCase().includes(storyFilter));
    const vps = conf.mobile ? ["desktop", "mobile"] : ["desktop"];
    for (const engine of engines) for (const vp of vps) for (const story of stories) jobs.push({ component: c, story, viewport: vp, engine, flows: conf.flows });
  }
  log(`Snabba kontroller: ${jobs.length} jämförelser (${names.join(", ")}) i ${engines.join(", ")}, ${workers} parallellt…`);
  let done = 0;
  const raw = [];
  const queue = [...jobs];
  await Promise.all(
    Array.from({ length: Math.min(workers, jobs.length) }, async () => {
      const contexts = {};
      for (;;) {
        const job = queue.shift();
        if (!job) break;
        const key = `${job.engine}-${job.viewport}`;
        const ctx = (contexts[key] ??= await browsers[job.engine].newContext({ viewport: viewports[job.viewport], reducedMotion: "reduce", locale: "sv-SE", timezoneId: "Europe/Stockholm" }));
        const page = await ctx.newPage();
        try {
          const kb = await checkSide(page, { base: sb.base, story: job.story, side: "kb", flows: job.flows, scheme });
          const sj = await checkSide(page, { base: sb.base, story: job.story, side: "sj", flows: job.flows, scheme });
          raw.push({ component: job.component, story: job.story.name, viewport: job.viewport, engine: job.engine, kb, sj });
        } catch (e) {
          log(`  Fel i ${job.component} / ${job.story.name}: ${e.message.split("\n")[0]}`);
        } finally {
          await page.close();
        }
        if (++done % 20 === 0 || done === jobs.length) log(`  ${done}/${jobs.length}`);
      }
      for (const ctx of Object.values(contexts)) await ctx.close();
    })
  );
  for (const b of Object.values(browsers)) await b.close();
  const knownList = loadKnown(join(here, "known-differences.json"));
  const order = (r) => `${names.indexOf(r.component)}|${r.story}|${r.viewport}|${r.engine}`;
  fast = raw.sort((a, b) => order(a).localeCompare(order(b))).map((r) => compareFast(r, knownList));
} else notChecked.push("träd, tangentbord och axe (--vo-only)");

let vo = [];
if (doVo) {
  const targets = [];
  for (const c of names) {
    const conf = components[c].vo;
    if (!conf) continue;
    for (const want of conf.stories) {
      const story = all[c].find((s) => sameName(s.name, want));
      if (story && (!storyFilter || story.name.toLowerCase().includes(storyFilter))) targets.push({ component: c, story, keys: conf.keys });
      else if (!story) log(`  VoiceOver: hittade inte storyn "${want}" i ${c}`);
    }
  }
  log(`VoiceOver i Safari: ${targets.length} stories × 2 sidor…`);
  const { runVoiceOver } = await import("./lib/vo.mjs");
  try {
    vo = compareVo(await runVoiceOver({ base: sb.base, targets, log }));
  } catch (e) {
    log(`VoiceOver gick inte att köra: ${e.message}`);
    notChecked.push(`VoiceOver (${e.message.split("\n")[0]})`);
  }
} else notChecked.push(isMac ? "VoiceOver (--no-vo)" : "VoiceOver i Safari (kräver Mac)");

sb.close();
const meta = { when: new Date().toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }), engines: [...engines, ...(vo.length ? ["VoiceOver + Safari"] : [])], notChecked, scheme, seconds: Math.round((Date.now() - t0) / 1000) };
const outDir = join(here, "report");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "results.json"), JSON.stringify({ meta, fast, vo }, null, 1));
writeFileSync(join(outDir, "index.html"), html({ fast, vo, meta }));
const md = markdown({ fast, vo, meta });
writeFileSync(join(outDir, "RAPPORT.md"), md);

const tally = (arr) => ["green", "known", "orange", "red"].map((s) => arr.filter((r) => r.status === s).length);
const [g, k, o, r] = tally(fast);
log(`\nKlart på ${meta.seconds} s.`);
if (doFast) log(`Träd, tangentbord och axe: ${g} lika, ${k} kända skillnader, ${o} skiljer, ${r} troligen fel i sj-ui.`);
if (vo.length) log(`VoiceOver: ${vo.filter((p) => p.status === "green").length} av ${vo.length} stories säger samma sak.`);
if (notChecked.length) log(`INTE kontrollerat: ${notChecked.join("; ")}`);
log(`Rapport: ${join(outDir, "index.html")}`);
process.exitCode = r > 0 ? 1 : 0;

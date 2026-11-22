/*
 * Render time, KB vs sj-ui: opens the Mätning/Prestanda story, runs it and prints a table.
 *   node scripts/perf.mjs [storybook url]   default http://127.0.0.1:6006 (use a built Storybook for real numbers)
 * Needs Playwright with Chromium.
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const base = process.argv[2] ?? "http://127.0.0.1:6006";
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(`${base}/iframe.html?viewMode=story&id=mätning-prestanda--renderingstid`);
await page.click("#run");
await page.waitForSelector("#results", { timeout: 300000 });
const rows = await page.$$eval("#results tbody tr", (trs) => trs.map((t) => ({ ...t.dataset })));
console.log("| Komponent | Antal | KB, median ms | sj-ui, median ms | sj-ui av KB |\n|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.name} | ${r.count} | ${r.kb} | ${r.sj} | ${Math.round((100 * r.sj) / r.kb)} % |`);
await browser.close();

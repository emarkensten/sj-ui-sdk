import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, readdirSync, statSync, writeFileSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
const app = join(repo, "apps/storybook");
const out = join(app, "storybook-static");
const stamp = join(out, ".a11y-built-at");

/** Newest modification time under the folders that change what Storybook shows. */
function newestSource() {
  let newest = 0;
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name.startsWith(".vite")) continue;
      const p = join(dir, name);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else newest = Math.max(newest, s.mtimeMs);
    }
  };
  for (const d of ["packages/sj-ui/src", "apps/storybook/stories", "apps/storybook/.storybook", "apps/storybook/package.json"]) {
    const p = join(repo, d);
    if (existsSync(p) && statSync(p).isFile()) newest = Math.max(newest, statSync(p).mtimeMs);
    else walk(p);
  }
  return newest;
}

function build(log) {
  if (!existsSync(join(app, "node_modules"))) {
    log("Installerar Storybooks beroenden (npm ci)…");
    const r = spawnSync("npm", ["ci", "--no-audit", "--no-fund"], { cwd: app, stdio: "inherit" });
    if (r.status !== 0) throw new Error("npm ci i apps/storybook misslyckades");
  }
  log("Bygger Storybook (en gång per ändring, cirka en minut)…");
  const r = spawnSync("npm", ["run", "build-storybook", "--", "--quiet"], { cwd: app, stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0) throw new Error("Storybook-bygget misslyckades");
  writeFileSync(stamp, String(Date.now()));
}

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };

/**
 * A Storybook to test against: --url if given, else a running dev server on 6006, else a static build
 * (rebuilt when sj-ui, the stories or the Storybook config changed since the last build).
 */
export async function storybook({ url, rebuild, log = console.log }) {
  if (url) return { base: url.replace(/\/$/, ""), close: () => {} };
  try {
    const r = await fetch("http://localhost:6006/index.json", { signal: AbortSignal.timeout(1500) });
    if (r.ok) {
      log("Använder Storybook som redan kör på http://localhost:6006");
      return { base: "http://localhost:6006", close: () => {} };
    }
  } catch {}
  const builtAt = existsSync(stamp) ? Number(readFileSync(stamp, "utf8")) : 0;
  if (rebuild || !existsSync(join(out, "index.json")) || newestSource() > builtAt) build(log);
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = join(out, path === "/" ? "index.html" : path);
    if (!file.startsWith(out) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => server.close() };
}

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export const sameName = (a, b) => norm(a) === norm(b);

/** The comparison stories, grouped by component. */
export async function comparisonStories(base) {
  const index = await (await fetch(`${base}/index.json`)).json();
  const out = {};
  for (const e of Object.values(index.entries)) {
    if (e.type !== "story" || !e.title.startsWith("Jämförelse/")) continue;
    const component = e.title.slice("Jämförelse/".length);
    (out[component] ??= []).push({ id: e.id, name: e.name, component });
  }
  return out;
}

export const storyUrl = (base, id, side, scheme = "light") =>
  `${base}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&a11y-side=${side}${scheme === "dark" ? "&globals=scheme:dark" : ""}`;

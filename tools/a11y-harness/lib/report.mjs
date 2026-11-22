import { existsSync, readFileSync } from "node:fs";

/* Compare KB with sj-ui and write the report: HTML to read, Markdown to paste, JSON for machines. */

/** Line diff (LCS). Returns [{op: " "|"-"|"+", line}]; "-" is KB only, "+" sj-ui only. */
export function diff(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) out.push({ op: " ", line: a[i++] }), j++;
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ op: "-", line: a[i++] });
    else out.push({ op: "+", line: b[j++] });
  }
  while (i < n) out.push({ op: "-", line: a[i++] });
  while (j < m) out.push({ op: "+", line: b[j++] });
  return out;
}
const changed = (d) => d.some((x) => x.op !== " ");
const lines = (s) => (s ?? "").split("\n");

export function loadKnown(path) {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8")).map((k) => ({ ...k, re: new RegExp(k.match) }));
}

/** A difference is known when every changed line matches a known-difference pattern for the component. */
function known(d, component, knownList) {
  const rules = knownList.filter((k) => k.component === component || k.component === "*");
  const ch = d.filter((x) => x.op !== " ");
  if (!ch.length || !rules.length) return null;
  const hit = rules.find((r) => ch.every((x) => r.re.test(x.line)));
  return hit ? hit.reason : null;
}

/** Compare the two sides of one fast-check result. */
export function compareFast(r, knownList) {
  const { kb, sj, component } = r;
  const findings = [];
  if (kb.errors.length || sj.errors.length) findings.push({ kind: "js", title: "JavaScript-fel på sidan", kb: kb.errors, sj: sj.errors, severity: sj.errors.length > kb.errors.length ? "red" : "orange" });

  const restDiff = diff(lines(kb.rest), lines(sj.rest));
  if (changed(restDiff)) {
    const k = known(restDiff, component, knownList);
    findings.push({ kind: "tree", title: "Tillgänglighetsträdet i vila", diff: restDiff, severity: k ? "known" : "orange", reason: k });
  }

  const kbAxe = new Map(kb.axe.map((v) => [v.id, v]));
  const sjAxe = new Map(sj.axe.map((v) => [v.id, v]));
  const onlySj = [...sjAxe.values()].filter((v) => !kbAxe.has(v.id));
  const onlyKb = [...kbAxe.values()].filter((v) => !sjAxe.has(v.id));
  const both = [...sjAxe.values()].filter((v) => kbAxe.has(v.id));
  if (onlySj.length) findings.push({ kind: "axe", title: "axe: fel bara i sj-ui", list: onlySj, severity: "red" });
  if (onlyKb.length) findings.push({ kind: "axe", title: "axe: fel bara i KB (sj-ui har rättat)", list: onlyKb, severity: "info" });
  if (both.length) findings.push({ kind: "axe", title: "axe: fel i båda", list: both, severity: "info" });

  for (const [flow, kbSteps] of Object.entries(kb.flows)) {
    const sjSteps = sj.flows[flow] ?? [];
    for (let i = 0; i < kbSteps.length; i++) {
      const a = kbSteps[i], b = sjSteps[i];
      if (!b) break;
      const focusSame = a.focus === b.focus;
      const treeDiff = diff(lines(a.tree), lines(b.tree));
      if (focusSame && !changed(treeDiff)) continue;
      const k = focusSame ? known(treeDiff, component, knownList) : known(diff([a.focus], [b.focus]), component, knownList);
      const keysSoFar = kbSteps.slice(0, i + 1).map((s) => keyName(s.key)).join(" → ");
      findings.push({
        kind: "flow",
        title: `Tangentbord: ${flow}, steg ${i + 1} (${keysSoFar})`,
        focus: focusSame ? null : { kb: a.focus, sj: b.focus },
        diff: changed(treeDiff) ? treeDiff : null,
        // Red when focus lands on another kind of element (or nowhere); orange when only name or state differs.
        severity: k ? "known" : focusSame || role(a.focus) === role(b.focus) ? "orange" : "red",
        reason: k,
      });
      break; // Later steps follow from the first difference.
    }
  }
  const worst = ["red", "orange", "known", "info"].find((s) => findings.some((f) => f.severity === s)) ?? "green";
  return { ...r, findings, status: worst === "info" ? "green" : worst };
}

export function compareVo(entries) {
  const pairs = {};
  for (const e of entries) (pairs[`${e.component}|${e.story}`] ??= { component: e.component, story: e.story })[e.side] = e;
  return Object.values(pairs).map((p) => {
    const kb = p.kb, sj = p.sj;
    if (!kb || !sj) return { ...p, status: "red", readDiff: [], keyDiffs: [] };
    const readDiff = diff(kb.read, sj.read);
    const keyDiffs = kb.keys.map((k, i) => ({ key: k.key, kb: k.spoken, sj: sj.keys[i]?.spoken ?? [], same: JSON.stringify(k.spoken) === JSON.stringify(sj.keys[i]?.spoken ?? []) }));
    const error = kb.error || sj.error;
    const status = error ? "red" : changed(readDiff) || keyDiffs.some((k) => !k.same) ? "orange" : "green";
    return { ...p, readDiff, keyDiffs, status, error };
  });
}

const role = (focusLine) => (focusLine.match(/^- (\w+)/) ?? [])[1] ?? focusLine;
const keyName = (k) => (k === " " ? "Space" : k);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const label = { green: "Lika", orange: "Skiljer", red: "Skiljer, troligen fel i sj-ui", known: "Känd skillnad", info: "Info" };

/** Only the changed lines and two lines around them. */
function hunks(d, ctx = 2) {
  const keep = d.map(() => false);
  d.forEach((x, i) => {
    if (x.op !== " ") for (let j = Math.max(0, i - ctx); j <= Math.min(d.length - 1, i + ctx); j++) keep[j] = true;
  });
  const out = [];
  d.forEach((x, i) => {
    if (keep[i]) out.push(x);
    else if (keep[i - 1]) out.push({ op: " ", line: "…" });
  });
  return out.length ? out : d;
}

function diffHtml(d, full = false) {
  if (!full) d = hunks(d);
  return `<pre class="diff">${d.map((x) => `<span class="op${x.op === " " ? "eq" : x.op === "-" ? "kb" : "sj"}">${x.op === " " ? "  " : x.op === "-" ? "KB " : "sj "}${esc(x.line)}</span>`).join("\n")}</pre>`;
}

function findingHtml(f) {
  let body = "";
  if (f.reason) body += `<p class="reason">Känd skillnad: ${esc(f.reason)}</p>`;
  if (f.focus) body += `<table class="focus"><tr><th>KB har fokus på</th><td>${esc(f.focus.kb)}</td></tr><tr><th>sj-ui har fokus på</th><td>${esc(f.focus.sj)}</td></tr></table>`;
  if (f.diff) body += diffHtml(f.diff);
  if (f.list) body += `<ul>${f.list.map((v) => `<li><b>${esc(v.id)}</b> (${esc(v.impact)}, ${v.nodes} element): ${esc(v.help)}<br><code>${esc(v.targets.join(" | "))}</code></li>`).join("")}</ul>`;
  if (f.kind === "js") body += `<p>KB: ${esc(f.kb.join("; ") || "inga")}<br>sj-ui: ${esc(f.sj.join("; ") || "inga")}</p>`;
  return `<div class="finding ${f.severity}"><h4><span class="pill ${f.severity}">${label[f.severity]}</span> ${esc(f.title)}</h4>${body}</div>`;
}

export function html({ fast, vo, meta }) {
  const comps = [...new Set([...fast.map((r) => r.component), ...vo.map((r) => r.component)])];
  const count = (arr, s) => arr.filter((r) => r.status === s).length;
  const summary = comps
    .map((c) => {
      const f = fast.filter((r) => r.component === c), v = vo.filter((r) => r.component === c);
      return `<tr><th><a href="#${c}">${c}</a></th><td>${f.length}</td><td class="g">${count(f, "green")}</td><td class="k">${count(f, "known")}</td><td class="o">${count(f, "orange")}</td><td class="r">${count(f, "red")}</td><td>${v.length ? `${count(v, "green")} lika, ${v.length - count(v, "green")} skiljer` : "–"}</td></tr>`;
    })
    .join("");

  const sections = comps
    .map((c) => {
      const f = fast.filter((r) => r.component === c).sort((a, b) => ["red", "orange", "known", "green"].indexOf(a.status) - ["red", "orange", "known", "green"].indexOf(b.status));
      const rows = f
        .map(
          (r) => `<details class="story ${r.status}" ${r.status === "red" ? "open" : ""}><summary><span class="pill ${r.status}">${label[r.status]}</span> ${esc(r.story)} <small>${r.viewport}, ${r.engine}</small> <a href="${esc(r.kb.url)}" target="_blank">KB</a> <a href="${esc(r.sj.url)}" target="_blank">sj-ui</a></summary>
          ${r.findings.map(findingHtml).join("") || "<p>Samma träd, samma fokus i alla tangentbordssteg och inga nya axe-fel.</p>"}
          <details class="raw"><summary>Hela trädet i vila</summary><div class="two"><div><h5>KB</h5><pre>${esc(r.kb.rest)}</pre></div><div><h5>sj-ui</h5><pre>${esc(r.sj.rest)}</pre></div></div></details>
          </details>`
        )
        .join("");
      const v = vo.filter((r) => r.component === c);
      const voRows = v
        .map(
          (p) => `<details class="story ${p.status}" open><summary><span class="pill ${p.status}">${label[p.status]}</span> VoiceOver i Safari: ${esc(p.story)}</summary>
          ${p.error ? `<p class="r">Fel under körningen: ${esc(p.error)}</p>` : ""}
          <h5>Läser komponenten (VO-höger, punkt för punkt)</h5>${diffHtml(p.readDiff, true)}
          <h5>Tangentbord</h5><table class="vo"><tr><th>Tangent</th><th>KB säger</th><th>sj-ui säger</th></tr>${p.keyDiffs.map((k) => `<tr class="${k.same ? "" : "o"}"><td>${esc(k.key)}</td><td>${esc(k.kb.join(" / "))}</td><td>${esc(k.sj.join(" / "))}</td></tr>`).join("")}</table>
          </details>`
        )
        .join("");
      return `<section id="${c}"><h2>${c}</h2>${voRows ? `<h3>VoiceOver</h3>${voRows}` : ""}<h3>Träd, tangentbord och axe</h3>${rows}</section>`;
    })
    .join("");

  return `<!doctype html><html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tillgänglighet KB mot sj-ui</title>
<style>
:root{--bg:#fff;--fg:#1a1a1a;--mute:#666;--line:#ddd;--g:#1b7a3a;--o:#b25e00;--r:#b3261e;--k:#555;--kb:#fde8e8;--sj:#e6f4ea;--code:#f6f6f6}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--fg:#eee;--mute:#aaa;--line:#333;--g:#5cc27a;--o:#f0a24a;--r:#ff7b72;--k:#aaa;--kb:#3a1d1d;--sj:#173322;--code:#1e1e1e}}
body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,sans-serif;margin:0;padding:24px 16px;max-width:1200px;margin-inline:auto}
h1{margin:0 0 4px}.meta{color:var(--mute);margin:0 0 24px}table{border-collapse:collapse}th,td{text-align:left;padding:6px 12px 6px 0;border-bottom:1px solid var(--line);vertical-align:top}
.g{color:var(--g)}.o{color:var(--o)}.r{color:var(--r)}.k{color:var(--k)}
.pill{display:inline-block;font-size:12px;font-weight:600;padding:1px 8px;border-radius:99px;border:1px solid currentColor;margin-right:6px}
.pill.green{color:var(--g)}.pill.orange{color:var(--o)}.pill.red{color:var(--r)}.pill.known,.pill.info{color:var(--k)}
details.story{border-top:1px solid var(--line);padding:8px 0}details.story>summary{cursor:pointer}summary small{color:var(--mute)}summary a{font-size:13px;margin-left:6px}
.finding{margin:8px 0 8px 16px}.finding h4{margin:8px 0 4px;font-size:14px}
pre{background:var(--code);padding:8px;overflow-x:auto;font-size:12px;line-height:1.45;margin:4px 0}.diff span{display:block}.opkb{background:var(--kb)}.opsj{background:var(--sj)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media (max-width:700px){.two{grid-template-columns:1fr}}
table.vo td{font-size:13px}tr.o td{color:var(--o)}.reason{color:var(--k);font-style:italic}section{margin-top:40px}
</style></head><body>
<h1>Tillgänglighet: KB mot sj-ui</h1>
<p class="meta">${esc(meta.when)} · ${esc(meta.engines.join(", "))} · ${fast.length} jämförelser${vo.length ? ` · ${vo.length} med VoiceOver i Safari` : " · VoiceOver kördes inte"}${meta.notChecked.length ? ` · INTE kontrollerat: ${esc(meta.notChecked.join(", "))}` : ""}</p>
<p>Varje rad är en story i Storybook, en sida i taget. <b>Skiljer, troligen fel i sj-ui</b> betyder att fokus hamnar på olika ställen, eller att axe hittar ett fel som KB inte har. <b>Skiljer</b> är en skillnad i tillgänglighetsträdet (roll, namn eller tillstånd) att titta på. <span class="opkb">KB</span>-rader finns bara i KB, <span class="opsj">sj</span>-rader bara i sj-ui.</p>
<table><tr><th>Komponent</th><th>Jämförelser</th><th class="g">Lika</th><th class="k">Kända</th><th class="o">Skiljer</th><th class="r">Troligen fel</th><th>VoiceOver</th></tr>${summary}</table>
${sections}
</body></html>`;
}

export function markdown({ fast, vo, meta }) {
  const comps = [...new Set([...fast.map((r) => r.component), ...vo.map((r) => r.component)])];
  const out = [`# Tillgänglighet: KB mot sj-ui`, ``, `${meta.when} · ${meta.engines.join(", ")} · ${fast.length} jämförelser · ${vo.length ? `${vo.length} med VoiceOver i Safari` : "VoiceOver kördes inte"}`, ``];
  if (meta.notChecked.length) out.push(`**INTE kontrollerat:** ${meta.notChecked.join(", ")}`, ``);
  out.push(`| Komponent | Lika | Kända | Skiljer | Troligen fel | VoiceOver |`, `|---|---|---|---|---|---|`);
  for (const c of comps) {
    const f = fast.filter((r) => r.component === c), v = vo.filter((r) => r.component === c);
    const n = (s) => f.filter((r) => r.status === s).length;
    out.push(`| ${c} | ${n("green")} | ${n("known")} | ${n("orange")} | ${n("red")} | ${v.length ? `${v.filter((p) => p.status === "green").length}/${v.length} lika` : "–"} |`);
  }
  for (const c of comps) {
    const bad = fast.filter((r) => r.component === c && (r.status === "red" || r.status === "orange"));
    const vbad = vo.filter((r) => r.component === c && r.status !== "green");
    if (!bad.length && !vbad.length) continue;
    out.push(``, `## ${c}`);
    for (const r of bad) {
      out.push(``, `**${r.story}** (${r.viewport}, ${r.engine})`);
      for (const f of r.findings.filter((f) => f.severity === "red" || f.severity === "orange")) {
        out.push(`- ${f.title}`);
        if (f.focus) out.push(`  - KB: \`${f.focus.kb}\``, `  - sj-ui: \`${f.focus.sj}\``);
        if (f.diff) for (const x of f.diff.filter((x) => x.op !== " ").slice(0, 8)) out.push(`  - ${x.op === "-" ? "bara KB" : "bara sj-ui"}: \`${x.line.trim()}\``);
        if (f.list) for (const v of f.list) out.push(`  - ${v.id}: ${v.help}`);
      }
    }
    for (const p of vbad) {
      out.push(``, `**VoiceOver: ${p.story}**${p.error ? ` (fel: ${p.error})` : ""}`);
      for (const x of p.readDiff.filter((x) => x.op !== " ")) out.push(`- ${x.op === "-" ? "bara KB" : "bara sj-ui"} säger: "${x.line}"`);
      for (const k of p.keyDiffs.filter((k) => !k.same)) out.push(`- ${k.key}: KB "${k.kb.join(" / ")}", sj-ui "${k.sj.join(" / ")}"`);
    }
  }
  return out.join("\n") + "\n";
}

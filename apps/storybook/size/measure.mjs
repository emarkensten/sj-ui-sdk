// Bundles the same five components from KB and from sj-ui (legacy layer) and prints
// minified and gzipped sizes, plus the largest packages in each bundle.
// React is external in both. Run: npm run size
import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL(".", import.meta.url));
const kb = (n) => (n / 1024).toFixed(0).padStart(5) + " kB";

async function measure(name, external = []) {
  const r = await build({
    entryPoints: [dir + name + ".tsx"],
    bundle: true, minify: true, format: "esm", jsx: "automatic", write: false, metafile: true,
    outdir: dir + "out", external: ["react", "react-dom", "react/jsx-runtime", ...external],
    loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "file", ".woff": "file" }, logLevel: "error",
  });
  const files = r.outputFiles.filter((f) => /\.(js|css)$/.test(f.path));
  const sum = (ext) => files.filter((f) => f.path.endsWith(ext)).reduce((a, f) => [a[0] + f.contents.length, a[1] + gzipSync(f.contents, { level: 9 }).length], [0, 0]);
  const [jsRaw, jsGz] = sum(".js"); const [cssRaw, cssGz] = sum(".css");
  const out = Object.values(r.metafile.outputs).find((o) => o.entryPoint);
  const pkgs = {};
  for (const [k, v] of Object.entries(out.inputs)) {
    const m = k.match(/node_modules\/((@[^/]+\/)?[^/]+)/);
    const key = m ? m[1] : "sj-ui (egen kod)";
    pkgs[key] = (pkgs[key] ?? 0) + v.bytesInOutput;
  }
  console.log(`\n${name}${external.length ? " utan " + external.join(", ") : ""}`);
  console.log(`  JS  ${kb(jsRaw)} minifierat, ${kb(jsGz)} gzip`);
  console.log(`  CSS ${kb(cssRaw)} minifierat, ${kb(cssGz)} gzip`);
  for (const [k, v] of Object.entries(pkgs).sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`   ${kb(v)}  ${k}`);
}

await measure("kb");
await measure("kb", ["@sj-ab/component-library.ui.trains"]);
await measure("sj");

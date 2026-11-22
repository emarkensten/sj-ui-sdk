import { chromium, webkit, firefox } from "playwright";
import { existsSync } from "node:fs";

const types = { chromium, webkit, firefox };

/**
 * Start the requested engines. In Claude's cloud only a preinstalled Chromium exists: use it there,
 * and skip engines that are not installed instead of failing the whole run.
 */
export async function launch(names, log) {
  const out = {};
  for (const name of names) {
    const type = types[name];
    if (!type) continue;
    try {
      out[name] = await type.launch();
    } catch (e) {
      if (name === "chromium" && existsSync("/opt/pw-browsers/chromium")) {
        out[name] = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => undefined);
        if (out[name]) continue;
      }
      log(`  ${name} gick inte att starta (${e.message.split("\n")[0]}). Kör "npx playwright install ${name}" i tools/a11y-harness.`);
    }
  }
  return out;
}

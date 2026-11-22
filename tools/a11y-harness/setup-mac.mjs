#!/usr/bin/env node
/*
 * One-time setup on a Mac: WebKit for the fast checks, and permission for Guidepup to drive VoiceOver.
 * macOS may show permission dialogs (Accessibility, Automation of Safari and VoiceOver): allow them.
 */
import { spawnSync } from "node:child_process";
const run = (cmd, args) => {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) console.log(`(avslutades med ${r.status}, fortsätter)`);
};
run("npx", ["playwright", "install", "webkit", "chromium"]);
if (process.platform === "darwin") {
  run("npx", ["--yes", "@guidepup/setup", "setup"]);
  run("npx", ["--yes", "@guidepup/setup", "install"]);
} else console.log("\nVoiceOver finns bara på macOS: hoppar över Guidepup.");

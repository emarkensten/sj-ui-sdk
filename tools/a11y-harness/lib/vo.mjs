import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { storyUrl } from "./storybook.mjs";

/*
 * Real VoiceOver in real Safari, driven by Guidepup. For each story and side: open the story with only
 * that side visible, let VoiceOver read the component from the start (VO-Right, item by item), then
 * reload and press the keys a keyboard user would, logging everything VoiceOver says after each one.
 *
 * macOS only. Only one VoiceOver run at a time on the Mac: a lock in /tmp stops two runs (from two
 * threads or terminals) from talking over each other.
 */

const LOCK = "/tmp/sj-voiceover.lock";
const MAX_READ = 25;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function takeLock(log) {
  const deadline = Date.now() + 15 * 60_000;
  for (;;) {
    try {
      mkdirSync(LOCK);
      writeFileSync(`${LOCK}/pid`, String(process.pid));
      return () => rmSync(LOCK, { recursive: true, force: true });
    } catch {
      const pid = Number(existsSync(`${LOCK}/pid`) ? readFileSync(`${LOCK}/pid`, "utf8") : 0);
      if (pid && !alive(pid)) {
        rmSync(LOCK, { recursive: true, force: true });
        continue;
      }
      if (Date.now() > deadline) throw new Error(`VoiceOver används av en annan körning (lås ${LOCK}, process ${pid}).`);
      log(`VoiceOver används av en annan körning (process ${pid}). Väntar…`);
      await sleep(20_000);
    }
  }
}

function safari(url) {
  const script = `tell application "Safari"
    activate
    if (count of windows) = 0 then make new document
    set URL of front document to "${url.replace(/"/g, '\\"')}"
  end tell`;
  execFileSync("/usr/bin/osascript", ["-e", script], { stdio: "ignore", timeout: 15000 });
}

const vokey = (k) => (k === " " ? "Space" : k);
const tidy = (s) => (s ?? "").replace(/\s+/g, " ").trim();
// VoiceOver's name for the page area in Safari, in Swedish or English.
const WEB_AREA = /webbinnehåll|web content|html[- ]innehåll|html content/i;
// Phrases that come from Safari's own interface, not from the page.
const SAFARI_UI = /verktygsfält|toolbar|avdelare|splitter|flikfält|tab bar|adressfält|smart search|sidofält|sidebar/i;

/**
 * Open the story and put VoiceOver inside the page: step through Safari's interface until VoiceOver
 * reaches the web content, then interact with it (VO-Shift-Down). Returns false if it never got there.
 */
async function enterPage(voiceOver, macOSActivate, url) {
  // Leave the previous page first: after interact() VoiceOver stays inside the old web area, and
  // would never announce "webbinnehåll" for the new one.
  for (let i = 0; i < 3; i++) await voiceOver.stopInteracting().catch(() => {});
  safari(url);
  await sleep(2500);
  await macOSActivate("Safari");
  await sleep(300);
  for (let i = 0; i < 12; i++) {
    const phrase = tidy(await voiceOver.lastSpokenPhrase());
    if (WEB_AREA.test(phrase)) {
      await voiceOver.interact();
      await sleep(400);
      return true;
    }
    await voiceOver.next();
  }
  return false;
}

export async function runVoiceOver({ base, targets, log = console.log }) {
  if (process.platform !== "darwin") throw new Error("VoiceOver finns bara på macOS.");
  const { voiceOver, macOSActivate } = await import("@guidepup/guidepup");
  const release = await takeLock(log);
  const results = [];
  try {
    await voiceOver.start();
    for (const t of targets) {
      for (const side of ["kb", "sj"]) {
        const url = storyUrl(base, t.story.id, side);
        log(`  VoiceOver: ${t.component} / ${t.story.name} / ${side}`);
        const entry = { component: t.component, story: t.story.name, side, url, read: [], keys: [], error: null };
        try {
          // 1. Read the component from the start, item by item (empty phrases skipped).
          if (!(await enterPage(voiceOver, macOSActivate, url))) throw new Error("VoiceOver nådde inte sidans innehåll (fastnade i Safaris gränssnitt).");
          let same = 0;
          for (let i = 0; i < MAX_READ; i++) {
            await voiceOver.next();
            const phrase = tidy(await voiceOver.lastSpokenPhrase());
            if (!phrase) continue;
            if (phrase === entry.read.at(-1) || SAFARI_UI.test(phrase)) {
              if (++same >= 2) break; // End of the page: VoiceOver repeats the last item.
              continue;
            }
            same = 0;
            entry.read.push(phrase);
          }
          if (!entry.read.length) throw new Error("VoiceOver läste ingenting inne på sidan.");
          // 2. Fresh page, then the keyboard flow: everything VoiceOver says after each key.
          if (!(await enterPage(voiceOver, macOSActivate, url))) throw new Error("VoiceOver nådde inte sidans innehåll inför tangentbordsflödet.");
          for (const key of t.keys) {
            await voiceOver.clearSpokenPhraseLog();
            // "VO:next" moves the VoiceOver cursor (VO-Right), "VO:act" activates the item under it
            // (VO-Space), as a VoiceOver user does. Anything else is a key press.
            if (key === "VO:next") await voiceOver.next();
            else if (key === "VO:act") await voiceOver.act();
            else await voiceOver.press(vokey(key));
            await sleep(900);
            let spoken = (await voiceOver.spokenPhraseLog()).map(tidy).filter(Boolean);
            if (!spoken.length) spoken = [tidy(await voiceOver.lastSpokenPhrase())].filter(Boolean);
            entry.keys.push({ key: vokey(key), spoken, outsidePage: spoken.some((p) => SAFARI_UI.test(p)) });
          }
        } catch (e) {
          entry.error = e.message.split("\n")[0];
        }
        results.push(entry);
      }
    }
  } finally {
    await voiceOver.stop().catch(() => {});
    release();
  }
  return results;
}

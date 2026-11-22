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
 * Open the story and put VoiceOver inside the page, whatever Safari's toolbar holds (extensions etc.).
 *
 * Moving the VoiceOver cursor to keyboard focus is not enough: after a page is loaded through
 * AppleScript, Safari keeps keyboard focus in its toolbar (VoiceOver lands on "Fliköversikt"), and
 * VO-Right inside the toolbar group only bounces between its last item and silence. So: leave the
 * current group (VO-Shift-Up), step with VO-Right until VoiceOver says "webbinnehåll", and interact
 * with it (VO-Shift-Down). If VoiceOver goes round in circles, leave one more level and try again.
 * Returns false if it never got there.
 */
async function enterPage(voiceOver, macOSActivate, url) {
  // Right after VoiceOver starts it sometimes misses the first page (the first story failed once in
  // a full run): load the page again once before giving up.
  for (let attempt = 0; attempt < 2; attempt++) if (await enterPageOnce(voiceOver, macOSActivate, url)) return true;
  return false;
}

async function enterPageOnce(voiceOver, macOSActivate, url) {
  safari(url);
  await sleep(2500);
  await macOSActivate("Safari");
  await sleep(300);
  await voiceOver.perform(voiceOver.keyboardCommands.moveCursorToKeyboardFocus).catch(() => {});
  await sleep(300);
  for (let level = 0; level < 3; level++) {
    await voiceOver.stopInteracting().catch(() => {});
    await sleep(300);
    let phrase = tidy(await voiceOver.lastSpokenPhrase());
    const seen = new Map();
    for (let i = 0; i <= 60; i++) {
      if (WEB_AREA.test(phrase)) {
        await voiceOver.interact();
        await sleep(400);
        return true;
      }
      if (phrase && (seen.set(phrase, (seen.get(phrase) ?? 0) + 1).get(phrase) ?? 0) >= 3) break; // going round in circles
      await voiceOver.next();
      phrase = tidy(await voiceOver.lastSpokenPhrase());
    }
  }
  return false;
}

/** Move the VoiceOver cursor onto the first thing in the page that says something. */
async function firstItem(voiceOver) {
  // After interacting with the web area VoiceOver sometimes already stands on the first item; with a
  // single-item page another VO-Right then only hits the end of the page.
  const here = tidy(await voiceOver.itemText().catch(() => ""));
  if (here && !WEB_AREA.test(here) && !SAFARI_UI.test(here)) return here;
  for (let i = 0; i < 4; i++) {
    await voiceOver.next();
    const phrase = tidy(await voiceOver.lastSpokenPhrase());
    if (phrase && !WEB_AREA.test(phrase) && !SAFARI_UI.test(phrase)) return phrase;
  }
  return "";
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
            if (WEB_AREA.test(phrase)) continue;
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
          if (!(await firstItem(voiceOver))) throw new Error("VoiceOver hittade ingen komponent att trycka på.");
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
            // VoiceOver often announces a state change (expanded, selected) without it reaching the
            // spoken phrase log. Then record what VoiceOver would say for the item under its cursor now.
            const cursor = tidy(await voiceOver.itemText().catch(() => ""));
            if (!spoken.length && cursor) spoken = [`[VO-markören] ${cursor}`];
            entry.keys.push({ key: vokey(key), spoken, cursor, outsidePage: spoken.some((p) => SAFARI_UI.test(p)) });
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

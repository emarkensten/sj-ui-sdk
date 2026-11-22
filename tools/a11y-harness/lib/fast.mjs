import { AxeBuilder } from "@axe-core/playwright";
import { storyUrl } from "./storybook.mjs";

/*
 * The fast checks, no screen reader needed: the accessibility tree at rest, keyboard flows (what has
 * focus and how the tree changes after each key) and axe. One side of a comparison at a time, so the
 * page holds only that implementation plus whatever it portals to <body> (menus, sheets, calendars).
 */

// Rules that judge the page around the story, not the component.
const AXE_SKIP = ["region", "landmark-one-main", "page-has-heading-one", "bypass", "html-has-lang", "document-title"];
const SETTLE = 300; // ms after a key: MUI's transitions are 225 ms (and off with reduced motion).

async function ready(page, url) {
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const root = document.getElementById("storybook-root");
    return root && root.childElementCount > 0 && document.activeElement === root;
  }, null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(150);
}

async function tree(page) {
  try {
    return clean(await page.locator("body").ariaSnapshot({ timeout: 5000 }));
  } catch (e) {
    return `(kunde inte läsa trädet: ${e.message.split("\n")[0]})`;
  }
}

/** Role, name and state of the focused element, as a screen reader would get them. */
async function focus(page) {
  const where = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body || el.id === "storybook-root") return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      focusVisible: el.matches(":focus-visible"),
      inside: Boolean(el.closest("#storybook-root")),
      visible: r.width > 0 && r.height > 0,
    };
  });
  if (!where) return "(ingen fokus i komponenten)";
  let snap = "";
  try {
    snap = clean(await page.locator(":focus").first().ariaSnapshot({ timeout: 2000 }));
  } catch {
    snap = `<${where.tag}>`;
  }
  // Where the element sits in the DOM (portal or not) is not something a user notices, so it is left out.
  const notes = [where.visible ? "" : "osynligt element", where.focusVisible ? "" : "ingen synlig fokusmarkering"].filter(Boolean);
  return snap.split("\n")[0].replace(/:$/, "") + (notes.length ? `  [${notes.join(", ")}]` : "");
}

/** Remove what legitimately differs between two renders: link targets and trailing spaces. */
function clean(s) {
  return s
    .split("\n")
    .filter((l) => !/^\s*- \/url:/.test(l))
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n");
}

async function axe(page) {
  try {
    const r = await new AxeBuilder({ page }).disableRules(AXE_SKIP).analyze();
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, targets: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) }));
  } catch (e) {
    return [{ id: "axe-error", impact: "n/a", help: e.message.split("\n")[0], nodes: 0, targets: [] }];
  }
}

/** Everything for one story, one side, one viewport, one engine. */
export async function checkSide(page, { base, story, side, flows, scheme }) {
  const url = storyUrl(base, story.id, side, scheme);
  const errors = [];
  const onError = (e) => errors.push(e.message.split("\n")[0]);
  page.on("pageerror", onError);
  try {
    await ready(page, url);
    const result = { url, rest: await tree(page), axe: await axe(page), flows: {}, errors };
    for (const [name, keys] of Object.entries(flows)) {
      await ready(page, url);
      const steps = [];
      for (const key of keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(SETTLE);
        steps.push({ key, focus: await focus(page), tree: await tree(page) });
      }
      result.flows[name] = steps;
    }
    return result;
  } finally {
    page.off("pageerror", onError);
  }
}

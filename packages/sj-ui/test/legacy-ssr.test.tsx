// The legacy layer (KB's props) renders on a server without a DOM and hydrates without mismatches,
// as the modern components do (ssr.test.tsx, hydration.test.tsx).
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { LegacyPage } from "./fixtures/legacy-page";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("renders KB's props in Node and hydrates without mismatches", async () => {
  const script = resolve(__dirname, "fixtures/render-legacy-server.tsx");
  const serverHtml = execFileSync("npx", ["vite-node", script], { encoding: "utf8" });
  expect(serverHtml).toContain('role="combobox"');
  expect(serverHtml).toContain('role="switch"');
  expect(serverHtml).toContain("495");
  expect(serverHtml).not.toMatch(/<style/);

  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.append(container);
  const serverSwitch = container.querySelector('[role="switch"]');

  const errors: unknown[] = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...a) => errors.push(a));
  await act(async () => {
    hydrateRoot(container, <LegacyPage />, { onRecoverableError: (e) => errors.push(e) });
  });
  spy.mockRestore();

  expect(errors).toEqual([]);
  expect(container.querySelector('[role="switch"]')).toBe(serverSwitch);
}, 30000);

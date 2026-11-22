// RFC criteria: client hydration reuses the server HTML. The HTML comes from a separate Node
// process with no DOM, as on a real server. React reports any mismatch through console.error or
// onRecoverableError, so both must stay silent.
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { Page } from "./fixtures/page";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("hydrates server HTML without mismatches", async () => {
  const script = resolve(__dirname, "fixtures/render-server.tsx");
  const serverHtml = execFileSync("npx", ["vite-node", script], { encoding: "utf8" });
  expect(serverHtml).toContain('data-slot="date-picker"');

  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.append(container);
  const serverSwitch = container.querySelector('[role="switch"]');

  const errors: unknown[] = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...a) => errors.push(a));
  await act(async () => {
    hydrateRoot(container, <Page />, { onRecoverableError: (e) => errors.push(e) });
  });
  spy.mockRestore();

  expect(errors).toEqual([]);
  // Hydration adopted the server's elements instead of replacing them.
  expect(container.querySelector('[role="switch"]')).toBe(serverSwitch);
}, 30000);

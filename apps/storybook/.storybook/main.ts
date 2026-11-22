import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const sjUi = fileURLToPath(new URL("../../../packages/sj-ui/src", import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  viteFinal: async (cfg) => {
    cfg.resolve ??= {};
    cfg.resolve.alias = [
      { find: /^@sj-ui-sdk\/sj-ui\/styles\.css$/, replacement: `${sjUi}/styles.css` },
      { find: /^@sj-ui-sdk\/sj-ui\/legacy\.css$/, replacement: `${sjUi}/legacy/legacy.css` },
      { find: /^@sj-ui-sdk\/sj-ui\/legacy\/(.*)$/, replacement: `${sjUi}/legacy/$1.tsx` },
      { find: /^@sj-ui-sdk\/sj-ui\/icons$/, replacement: `${sjUi}/icons/index.tsx` },
      { find: /^@sj-ui-sdk\/sj-ui$/, replacement: `${sjUi}/index.ts` },
    ];
    // sj-ui's source sits outside this app: make sure everyone shares one React and one ui-sdk.
    cfg.resolve.dedupe = ["react", "react-dom", "@ui-sdk/react", "@ui-sdk/core"];
    cfg.server ??= {};
    cfg.server.fs = { allow: ["../../.."] };
    return cfg;
  },
};

export default config;

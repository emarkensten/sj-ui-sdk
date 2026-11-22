import type { Preview } from "@storybook/react-vite";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { generateThemeOptions } from "@sj-ab/component-library.styles.themes";
import { useEffect, useMemo } from "react";
import "@sj-ui-sdk/sj-ui/styles.css";
import "@sj-ui-sdk/sj-ui/legacy.css";
import "./preview.css";

// Accessibility harness (tools/a11y-harness): ?a11y-side=kb|sj shows only one side of a comparison,
// so a screen reader hears one implementation at a time. Has no effect without the parameter.
const a11ySide = new URLSearchParams(window.location.search).get("a11y-side");
if (a11ySide === "kb" || a11ySide === "sj") document.documentElement.dataset.a11ySide = a11ySide;
let a11yFocused = false;

const preview: Preview = {
  globalTypes: {
    scheme: {
      description: "Ljust eller mörkt läge",
      toolbar: { title: "Läge", icon: "mirror", items: [{ value: "light", title: "Ljust" }, { value: "dark", title: "Mörkt" }], dynamicTitle: true },
    },
  },
  initialGlobals: { scheme: "light" },
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    options: { storySort: { order: ["Översikt", "Jämförelse", "Nytt API", "Web Components"] } },
  },
  decorators: [
    (Story, ctx) => {
      const scheme = ctx.globals.scheme === "dark" ? "dark" : "light";
      const theme = useMemo(() => createTheme(generateThemeOptions(scheme, false)), [scheme]);
      useEffect(() => {
        document.documentElement.style.colorScheme = scheme;
        document.documentElement.dataset.colorScheme = scheme;
      }, [scheme]);
      useEffect(() => {
        // In the harness, start with focus just before the component: the first Tab lands on it,
        // and VoiceOver starts reading there instead of in Safari's toolbar.
        if (!a11ySide || a11yFocused) return;
        a11yFocused = true;
        const root = document.getElementById("storybook-root");
        if (root) {
          root.tabIndex = -1;
          root.style.outline = "none";
          root.focus({ preventScroll: true });
        }
      }, []);
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;

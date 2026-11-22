import type { Preview } from "@storybook/react-vite";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { generateThemeOptions } from "@sj-ab/component-library.styles.themes";
import { useEffect, useMemo } from "react";
import "@sj-ui-sdk/sj-ui/styles.css";
import "@sj-ui-sdk/sj-ui/legacy.css";
import "./preview.css";

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
      }, [scheme]);
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

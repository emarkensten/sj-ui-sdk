import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@sj-ui-sdk/sj-ui/styles.css";
import "./demo.css";
import { Typography } from "@sj-ui-sdk/sj-ui";
import { NewApiPage } from "./NewApiPage";

function App() {
  const [scheme, setScheme] = useState<"light" | "dark">(() => (new URLSearchParams(location.search).get("dark") ? "dark" : "light"));
  useEffect(() => {
    document.documentElement.style.colorScheme = scheme;
    document.documentElement.dataset.colorScheme = scheme;
  }, [scheme]);
  return (
    <main className="page">
      <header className="row header">
        <Typography as="h1" variant="largeTitleEmphasized">
          sj-ui pilot
        </Typography>
        <button className="link" type="button" onClick={() => setScheme(scheme === "light" ? "dark" : "light")}>
          {scheme === "light" ? "Mörkt läge" : "Ljust läge"}
        </button>
      </header>
      <NewApiPage />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

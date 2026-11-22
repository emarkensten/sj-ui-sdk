// Runs in plain Node (no DOM), like a real server, and prints the legacy page's HTML.
import { renderToString } from "react-dom/server";
import { LegacyPage } from "./legacy-page";

process.stdout.write(renderToString(<LegacyPage />));

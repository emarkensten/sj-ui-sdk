// Runs in plain Node (no DOM), like a real server, and prints the HTML.
import { renderToString } from "react-dom/server";
import { Page } from "./page";

process.stdout.write(renderToString(<Page />));

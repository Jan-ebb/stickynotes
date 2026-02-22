import { installBrowserMocks, ensureNoteId } from "./lib/browser-mock";

// Install mocks before any Tauri API calls
installBrowserMocks();

import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/geist-mono";
import App from "./App";

// If no noteId in URL and running in browser, inject one
(async () => {
  const params = new URLSearchParams(window.location.search);
  if (!params.get("noteId")) {
    const id = await ensureNoteId();
    params.set("noteId", id);
    window.history.replaceState({}, "", `?${params.toString()}`);
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
})();

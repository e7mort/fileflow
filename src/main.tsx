import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { StoreProvider } from "./store/store";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Fileflow root element is missing");
}

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);

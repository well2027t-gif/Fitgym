import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Router, useHashLocation } from "./lib/router";

createRoot(document.getElementById("root")!).render(
  <Router hook={useHashLocation}>
    <App />
  </Router>
);

import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import App from "./App.jsx";
import "./index.css";

// ─── Axios Global Defaults ────────────────────────────────────────────────────
// VITE_API_HOST is "" in dev (Vite proxy handles routing)
// and "https://be.machmate.in" in production.
axios.defaults.baseURL = import.meta.env.VITE_API_HOST || "";
// Always send session cookies with every request.
axios.defaults.withCredentials = true;
// ─────────────────────────────────────────────────────────────────────────────

function Root() {
  useEffect(() => {
    // Remove preloader once React is mounted
    const preloader = document.getElementById("preloader");
    if (preloader) preloader.remove();
  }, []);

  return (
    <StrictMode>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Root />);

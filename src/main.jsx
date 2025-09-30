import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
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

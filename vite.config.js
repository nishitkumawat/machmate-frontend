import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiHost = env.VITE_API_HOST || "http://127.0.0.1:8000";

  return {
    plugins: [react(), tailwindcss()],
    base: "/",
    build: {
      outDir: "dist",
    },
    server: {
      proxy: {
        // Proxy all /auth, /buyer, /maker, /subscriptions, /csrf, /contact
        // requests to the Django backend in development.
        // This eliminates the need for CORS headers during local dev.
        "/auth": {
          target: apiHost,
          changeOrigin: true,
          secure: false,
        },
        "/buyer": {
          target: apiHost,
          changeOrigin: true,
          secure: false,
        },
        "/maker": {
          target: apiHost,
          changeOrigin: true,
          secure: false,
        },
        "/subscriptions": {
          target: apiHost,
          changeOrigin: true,
          secure: false,
        },
        "/csrf": {
          target: apiHost,
          changeOrigin: true,
          secure: false,
        },
        "/contact": {
          target: apiHost,
          changeOrigin: true,
          secure: false,
        },
        "/admin": {
          target: apiHost,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

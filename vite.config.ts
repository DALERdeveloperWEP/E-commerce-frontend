import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [
    react(),
    TanStackRouterVite(),
    tsconfigPaths(),
    tailwindcss(),
    {
      name: 'rewrite-logic',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Serve static landing page at root
          if (req.url === '/') {
            try {
              const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
              res.setHeader('Content-Type', 'text/html');
              res.end(html);
              return;
            } catch (e) {
              console.error('Error serving index.html:', e);
            }
          }

          // Redirect /index.html to /
          if (req.url === '/index.html') {
            res.writeHead(301, { Location: '/' });
            res.end();
            return;
          }

          // Handle admin SPA routes
          if (req.url?.startsWith('/admin') && !req.url.includes('.')) {
            req.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        admin: "admin.html",
      },
    },
  },
});
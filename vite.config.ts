import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Served from GitHub Pages as a project site: https://<user>.github.io/Sudokupwa/
const base = "/Sudokupwa/";

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        id: base,
        name: "Sudoku",
        short_name: "Sudoku",
        description: "Sudoku ohne Werbung, mit mehreren Schwierigkeitsgraden.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#f4f6fb",
        theme_color: "#3a5a9c",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      },
    }),
  ],
});

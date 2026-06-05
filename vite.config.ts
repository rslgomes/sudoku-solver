import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svgr(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
      "@features": path.resolve(__dirname, "src/features"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@styles": path.resolve(__dirname, "src/styles"),
    },
  },
});

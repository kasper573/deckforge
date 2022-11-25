import * as path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, "src/app"),
  publicDir: path.resolve(__dirname, "src/app/public"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  plugins: [
    react(),
    checker({
      eslint: { lintCommand: "lint" },
      typescript: true,
      overlay: false,
    }),
  ],
  envDir: __dirname,
});

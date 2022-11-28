import "dotenv-flow/config";
import * as path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

const port = process.env.VITE_APP_PORT
  ? parseInt(process.env.VITE_APP_PORT, 10)
  : undefined;

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
      typescript: {
        tsconfigPath: path.resolve(__dirname, "tsconfig.react.json"),
      },
      overlay: false,
      enableBuild: false,
    }),
  ],
  envDir: __dirname,
  server: { port },
  preview: { port },
});

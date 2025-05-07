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
        tsconfigPath: path.resolve(__dirname, "src/app/tsconfig.json"),
      },
      overlay: false,
      enableBuild: false,
    }),
  ],
  envDir: __dirname,
  server: { port },
  preview: { port },
  define: {
    // Required for cypress-testing-library
    "process.env.DEBUG_PRINT_LIMIT": 10000,
    // Since we cannot rename Vercel's env vars we need use define to make them available
    "import.meta.env.VITE_ANALYTICS_ID": JSON.stringify(
      process.env.VERCEL_ANALYTICS_ID
    ),
  },
});

import { defineConfig } from "cypress";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenvFlowPlugin = require("cypress-dotenv-flow");

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: false,

  e2e: {
    specPattern: "cypress/**/*.spec.ts",
    setupNodeEvents(on, config) {
      return dotenvFlowPlugin(config, {}, true);
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});

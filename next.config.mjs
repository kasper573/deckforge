import nextTypeSafePages from "next-type-safe-routes/plugin.js";

// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    emotion: true
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default nextTypeSafePages(config);

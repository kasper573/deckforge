import { z } from "zod";
import { loadEnv } from "../shared/util/loadEnv";
import { zodNumeric } from "../shared/util/zod/zodNumeric";
import { zodBooleanish } from "../shared/util/zod/zodBooleanish";

const schema = z.object({
  apiPort: zodNumeric.optional(),
  enableLoggerLink: zodBooleanish.default(false),
  enableAnalytics: zodBooleanish.default(false),
  auth0: z.object({
    domain: z.string(),
    clientId: z.string(),
    issuer: z.string(),
    cacheLocation: z.enum(["memory", "localstorage"]),
    useRefreshTokens: zodBooleanish.default(false),
    legacySameSiteCookie: zodBooleanish.default(false),
    authorizationParams: z.object({
      audience: z.string(),
      redirect_uri: z.string().url(),
    }),
    logoutParams: z.object({
      returnTo: z.string().url(),
    }),
  }),
});

export const env = loadEnv(schema, {
  apiPort: import.meta.env.VITE_API_PORT,
  enableLoggerLink: import.meta.env.VITE_ENABLE_LOGGER_LINK,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS,
  auth0: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    issuer: import.meta.env.VITE_AUTH0_ISSUER,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    cacheLocation: import.meta.env.VITE_AUTH0_CACHE_LOCATION,
    useRefreshTokens: import.meta.env.VITE_AUTH0_USE_REFRESH_TOKENS,
    authorizationParams: {
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      redirect_uri: window.location.origin,
    },
    logoutParams: {
      returnTo: window.location.origin,
    },
  },
});

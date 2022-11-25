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
    redirectUri: z.string(),
  }),
});

export const env = loadEnv(schema, {
  apiPort: import.meta.env.VITE_API_PORT,
  enableLoggerLink: import.meta.env.VITE_ENABLE_LOGGER_LINK,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS,
  auth0: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    redirectUri: window.location.origin,
  },
});

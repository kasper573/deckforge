import { z } from "zod";
import { loadEnv } from "../shared/util/loadEnv";
import { zodNumeric } from "../shared/util/zod/zodNumeric";
import { zodBooleanish } from "../shared/util/zod/zodBooleanish";

const schema = z.object({
  API_PORT: zodNumeric.optional(),
  ENABLE_LOGGER_LINK: zodBooleanish.default(false),
  ENABLE_ANALYTICS: zodBooleanish.default(false),
  Auth0: z.object({
    domain: z.string(),
    clientId: z.string(),
    redirectUri: z.string(),
  }),
});

export const env = loadEnv(schema, {
  API_PORT: import.meta.env.VITE_API_PORT,
  ENABLE_LOGGER_LINK: import.meta.env.VITE_ENABLE_LOGGER_LINK,
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
  Auth0: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    redirectUri: window.location.origin,
  },
});

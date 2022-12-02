import { z } from "zod";
import { zodNumeric } from "../lib/zod-extensions/zodNumeric";
import { zodBooleanish } from "../lib/zod-extensions/zodBooleanish";

const schema = z.object({
  apiPort: zodNumeric.optional(),
  enableLoggerLink: zodBooleanish.default(false),
  enableAnalytics: zodBooleanish.default(false),
  showErrorDetails: zodBooleanish.default(false),
});

export const env = schema.parse({
  apiPort: import.meta.env.VITE_API_PORT,
  enableLoggerLink: import.meta.env.VITE_ENABLE_LOGGER_LINK,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS,
  authImplementation: import.meta.env.VITE_AUTH_IMPLEMENTATION,
  showErrorDetails: import.meta.env.VITE_SHOW_ERROR_DETAILS,
});

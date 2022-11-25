import { z } from "zod";
import { loadEnv } from "../shared/util/loadEnv";
import { zodNumeric } from "../shared/util/zod/zodNumeric";
import { zodBooleanish } from "../shared/util/zod/zodBooleanish";

const schema = z.object({
  API_PORT: zodNumeric.optional(),
  ENABLE_LOGGER_LINK: zodBooleanish.default(false),
  ENABLE_ANALYTICS: zodBooleanish.default(false),
});

export const env = loadEnv(schema, {
  API_PORT: import.meta.env.VITE_API_PORT,
  ENABLE_LOGGER_LINK: import.meta.env.VITE_ENABLE_LOGGER_LINK,
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
});

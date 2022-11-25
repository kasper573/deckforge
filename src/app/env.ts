import { z } from "zod";
import { loadEnv } from "../shared/util/loadEnv";
import { zodNumeric } from "../shared/util/zod/zodNumeric";
import { zodBooleanish } from "../shared/util/zod/zodBooleanish";

const schema = z.object({
  VITE_API_PORT: zodNumeric.optional(),
  VITE_ENABLE_LOGGER_LINK: zodBooleanish.default(false),
  VITE_ENABLE_ANALYTICS: zodBooleanish.default(false),
});

export const env = loadEnv(schema, import.meta.env);

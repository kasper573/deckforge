import { z } from "zod";
import { zodNumeric } from "../lib/zod-extensions/zodNumeric";
import { zodBooleanish } from "../lib/zod-extensions/zodBooleanish";

const schema = z.object({
  apiPort: zodNumeric.optional(),
  enableLoggerLink: zodBooleanish.default(false),
  showErrorDetails: zodBooleanish.default(false),
  webVitalsUrl: z.string().url().optional(),
  analyticsId: z.string().optional(),
  moduleCompiler: z
    .object({
      memoryLeaks: z
        .union([z.literal("warn"), z.literal("error"), z.literal("ignore")])
        .default("error"),
    })
    .default({}),
});

export const env = schema.parse({
  apiPort: import.meta.env.VITE_API_PORT,
  enableLoggerLink: import.meta.env.VITE_ENABLE_LOGGER_LINK,
  showErrorDetails: import.meta.env.VITE_SHOW_ERROR_DETAILS,
  webVitalsUrl: import.meta.env.VITE_WEBVITALS_URL,
  analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  moduleCompiler: {
    showMemoryLeakWarnings: import.meta.env.VITE_MODULE_COMPILER_MEMORY_LEAKS,
  },
});

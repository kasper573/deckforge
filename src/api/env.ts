import * as dotEnvFlow from "dotenv-flow";
import { z } from "zod";
import { zodNumeric } from "../lib/zod-extensions/zodNumeric";
import { zodBooleanish } from "../lib/zod-extensions/zodBooleanish";

dotEnvFlow.config({ purge_dotenv: true });

const databaseLogType = z.enum(["error", "query", "warn"]);

const schema = z.object({
  apiPort: zodNumeric,
  databaseLogs: z.array(databaseLogType).default([]),
  exposeInternalErrors: zodBooleanish.default(false),
  jwtSecret: z.string(),
});

export const env = schema.parse({
  databaseLogs: process.env.DATABASE_LOGS?.split(","),
  apiPort: process.env.VITE_API_PORT,
  databaseUrl: process.env.DATABASE_URL,
  environment: process.env.NODE_ENV,
  exposeInternalErrors: process.env.EXPOSE_INTERNAL_ERRORS,
  jwtSecret: process.env.AUTH_SECRET,
});

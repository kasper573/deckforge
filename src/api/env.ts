import * as dotEnvFlow from "dotenv-flow";
import { z } from "zod";
import { zodNumeric } from "../lib/zod-extensions/zodNumeric";
import { zodBooleanish } from "../lib/zod-extensions/zodBooleanish";

dotEnvFlow.config({ purge_dotenv: true });

const databaseLogType = z.enum(["error", "query", "warn"]);
const serverLogType = z.enum(["error"]);

const schema = z.object({
  apiPort: zodNumeric,
  databaseLogs: z.array(databaseLogType).default([]),
  serverLogs: z.array(serverLogType).default([]),
  exposeInternalErrors: zodBooleanish.default(false),
  jwtSecret: z.string(),
  seed: z
    .object({
      adminUser: z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
      }),
    })
    .optional(),
});

const adminUser = {
  name: process.env.SEED_ADMIN_NAME,
  email: process.env.SEED_ADMIN_EMAIL,
  password: process.env.SEED_ADMIN_PASSWORD,
};

const hasAdminUser = Object.values(adminUser).filter(Boolean).length > 0;

export const env = schema.parse({
  databaseLogs: process.env.DATABASE_LOGS?.split(","),
  serverLogs: process.env.SERVER_LOGS?.split(","),
  apiPort: process.env.VITE_API_PORT,
  databaseUrl: process.env.DATABASE_URL,
  environment: process.env.NODE_ENV,
  exposeInternalErrors: process.env.EXPOSE_INTERNAL_ERRORS,
  jwtSecret: process.env.AUTH_SECRET,
  seed: hasAdminUser ? { adminUser } : undefined,
});

import * as dotEnvFlow from "dotenv-flow";
import { z } from "zod";
import { zodNumeric } from "../lib/zod-extensions/zodNumeric";
import { zodBooleanish } from "../lib/zod-extensions/zodBooleanish";
import { authenticatorOptionsType } from "./services/user/authenticator";

dotEnvFlow.config({ purge_dotenv: true });

const prismaLogType = z.enum(["error", "query", "warn"]);

const schema = z.object({
  apiPort: zodNumeric,
  databaseLogs: z.array(prismaLogType).default([]),
  exposeInternalErrors: zodBooleanish.default(false),
  auth: authenticatorOptionsType,
});

export const env = schema.parse({
  databaseLogs: process.env.DATABASE_LOGS?.split(","),
  apiPort: process.env.VITE_API_PORT,
  databaseUrl: process.env.DATABASE_URL,
  environment: process.env.NODE_ENV,
  exposeInternalErrors: process.env.EXPOSE_INTERNAL_ERRORS,
  authImplementation: process.env.VITE_AUTH_IMPLEMENTATION,
  auth: {
    secret: process.env.AUTH_SECRET,
    tokenLifetime: process.env.AUTH_TOKEN_LIFETIME,
    algorithms: process.env.AUTH_ALGORITHMS?.split(","),
  },
});

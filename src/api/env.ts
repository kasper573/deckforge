import * as dotEnvFlow from "dotenv-flow";
import { z } from "zod";
import { zodNumeric } from "../shared/util/zod/zodNumeric";
import { zodBooleanish } from "../shared/util/zod/zodBooleanish";
import { authImplementationType } from "./services/auth/types";

dotEnvFlow.config({ purge_dotenv: true });

// prettier-ignore
const algorithmType = z.enum(["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512"]);

const prismaLogType = z.enum(["error", "query", "warn"]);

const schema = z.object({
  apiPort: zodNumeric,
  prismaLogs: z.array(prismaLogType).default([]),
  exposeInternalErrors: zodBooleanish.default(false),
  authImplementation: authImplementationType,
  jwks: z.object({
    requestsPerMinute: zodNumeric,
    uri: z.string().url(),
  }),
  jwt: z.object({
    audience: z.string(),
    issuer: z.string(),
    algorithms: z.array(algorithmType),
  }),
});

export const env = schema.parse({
  prismaLogs: process.env.PRISMA_LOGS?.split(","),
  apiPort: process.env.VITE_API_PORT,
  databaseUrl: process.env.DATABASE_URL,
  environment: process.env.NODE_ENV,
  exposeInternalErrors: process.env.EXPOSE_INTERNAL_ERRORS,
  authImplementation: process.env.VITE_AUTH_IMPLEMENTATION,
  jwks: {
    uri: process.env.JWKS_URI,
    requestsPerMinute: process.env.JWKS_REQUESTS_PER_MINUTE,
  },
  jwt: {
    audience: process.env.VITE_AUTH0_AUDIENCE,
    issuer: process.env.VITE_AUTH0_ISSUER,
    algorithms: process.env.JWT_ALGORITHMS?.split(","),
  },
});

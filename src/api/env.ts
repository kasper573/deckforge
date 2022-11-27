import * as dotEnvFlow from "dotenv-flow";
import { z } from "zod";
import { loadEnv } from "../shared/util/loadEnv";
import { zodNumeric } from "../shared/util/zod/zodNumeric";

dotEnvFlow.config({
  default_node_env: "development",
  purge_dotenv: true,
});

// prettier-ignore
const algorithmType = z.enum(["HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512"]);

const schema = z.object({
  apiPort: zodNumeric.optional(),
  databaseUrl: z.string().url(),
  environment: z.enum(["development", "test", "production"]),
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

export const env = loadEnv(schema, {
  apiPort: process.env.VITE_API_PORT,
  databaseUrl: process.env.DATABASE_URL,
  environment: process.env.NODE_ENV,
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

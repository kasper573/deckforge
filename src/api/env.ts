import * as dotEnvFlow from "dotenv-flow";
import { z } from "zod";
import { loadEnv } from "../shared/util/loadEnv";
import { zodNumeric } from "../shared/util/zod/zodNumeric";

dotEnvFlow.config({
  default_node_env: "development",
  purge_dotenv: true,
});

const schema = z.object({
  apiPort: zodNumeric.optional(),
  databaseUrl: z.string().url(),
  environment: z.enum(["development", "test", "production"]),
});

export const env = loadEnv(schema, {
  apiPort: process.env.VITE_API_PORT,
  databaseUrl: process.env.DATABASE_URL,
  environment: process.env.NODE_ENV,
});

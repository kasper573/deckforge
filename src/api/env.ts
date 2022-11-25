import * as dotEnvFlow from "dotenv-flow";
import { z } from "zod";
import { loadEnv } from "../shared/util/loadEnv";
import { zodNumeric } from "../shared/util/zod/zodNumeric";

dotEnvFlow.config({ default_node_env: "development" });

const schema = z.object({
  VITE_API_PORT: zodNumeric.optional(),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export const env = loadEnv(schema, process.env);

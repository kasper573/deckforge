import type { ZodType } from "zod";
import type * as zod from "zod";

export function loadEnv<T extends ZodType>(
  schema: T,
  source: unknown
): zod.infer<T> {
  const result = schema.safeParse(source);
  if (result.success === true) {
    return result.data;
  }

  throw new Error(
    "Invalid environment variables:\n" + JSON.stringify(result.error, null, 2)
  );
}

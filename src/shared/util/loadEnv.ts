import type { ZodType } from "zod";

export function loadEnv<T extends ZodType>(schema: T, source: unknown) {
  const result = schema.safeParse(source);
  if (result.success === true) {
    return result.data;
  }
  const formattedErrors = Object.entries(result.error.format())
    .map(([name, value]) =>
      "_errors" in value
        ? `${name}: ${(value._errors as unknown[]).join(", ")}\n`
        : undefined
    )
    .filter(Boolean);

  throw new Error(
    "Invalid environment variables:\n" + formattedErrors.join("\n")
  );
}

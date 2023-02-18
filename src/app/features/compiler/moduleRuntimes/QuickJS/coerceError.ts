import { z } from "zod";

export function coerceError(input: unknown, description: string): Error {
  const result = errorType.safeParse(input);
  if (result.success) {
    const { name, message, stack } = result.data;
    return new Error(`${description}: ${name}: ${message}\n${stack}`);
  }
  return new Error(description + ": " + String(input));
}

const errorType = z.object({
  message: z.string(),
  name: z.string(),
  stack: z.string(),
});

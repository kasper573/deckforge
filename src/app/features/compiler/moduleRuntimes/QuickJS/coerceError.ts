import { z } from "zod";

export function coerceError(input: unknown): string {
  const errorObjectResult = errorType.safeParse(input);
  if (errorObjectResult.success) {
    const { name, message, stack } = errorObjectResult.data;
    return `${name}: ${message}\n${stack}`;
  }

  const errorMessage = String(input).trim();
  if (errorMessage) {
    return errorMessage;
  }

  return "Unknown error";
}

const errorType = z.object({
  message: z.string(),
  name: z.string(),
  stack: z.string(),
});

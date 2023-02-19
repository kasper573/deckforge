import { z } from "zod";

export function coerceError(input: unknown, description: string): string {
  const errorObjectResult = errorType.safeParse(input);
  if (errorObjectResult.success) {
    const { name, message, stack } = errorObjectResult.data;
    return `${description}: ${name}: ${message}\n${stack}`;
  }

  const errorMessage = String(input).trim();
  if (errorMessage) {
    return `${description}: ${errorMessage}`;
  }

  return `${description}: Unknown error`;
}

const errorType = z.object({
  message: z.string(),
  name: z.string(),
  stack: z.string(),
});

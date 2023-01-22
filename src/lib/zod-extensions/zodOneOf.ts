import { z } from "zod";

export function zodOneOf<
  T extends string | number | bigint | boolean | null | undefined
>(values: T[]) {
  if (values.length < 2) {
    throw new Error("At least two values are required");
  }
  const [first, second, ...rest] = values.map((value) => z.literal(value));
  return z.union([first, second, ...rest]);
}

import type { z, ZodType } from "zod";
import superjson from "superjson";

export function createZodStorage<T extends ZodType>(
  schema: T,
  localStorageKey: string,
  fallbackValue: z.infer<T>
) {
  function save(value: z.infer<T>) {
    localStorage.setItem(localStorageKey, superjson.stringify(value));
  }

  function load(): z.infer<T> {
    try {
      return schema.parse(
        superjson.parse(localStorage.getItem(localStorageKey) ?? "undefined")
      );
    } catch {
      return fallbackValue;
    }
  }

  return { save, load };
}

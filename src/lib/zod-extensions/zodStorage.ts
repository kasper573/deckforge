import type { z, ZodType } from "zod";

export function createZodStorage<T extends ZodType>(
  schema: T,
  localStorageKey: string
) {
  function save(value: z.infer<T>) {
    localStorage.setItem(localStorageKey, JSON.stringify(value));
  }

  function load(): z.infer<T> | undefined {
    try {
      return schema.parse(
        JSON.parse(localStorage.getItem(localStorageKey) ?? "")
      );
    } catch {}
  }

  return { save, load };
}

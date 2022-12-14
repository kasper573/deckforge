import type { z, ZodType } from "zod";

export function createZodStorage<T extends ZodType>(
  schema: T,
  localStorageKey: string
) {
  function save(value: z.infer<T>) {
    localStorage.setItem(localStorageKey, JSON.stringify(value));
  }

  function load(emptyValue?: z.infer<T>): z.infer<T> | undefined {
    try {
      const jsonString = localStorage.getItem(localStorageKey);
      if (jsonString === null) {
        return emptyValue;
      }
      const json =
        jsonString === "undefined" || jsonString === null
          ? undefined
          : JSON.parse(jsonString);
      return schema.parse(json);
    } catch {}
  }

  return { save, load };
}

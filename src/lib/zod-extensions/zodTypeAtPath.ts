import type { ZodType } from "zod";
import { ZodObject } from "zod";

export function zodTypeAtPath(schema: ZodType, path: string): ZodType {
  const parts = path.split(".");
  let type: ZodType = schema;
  for (const part of parts) {
    if (type instanceof ZodObject) {
      type = type.shape[part];
    } else {
      throw new Error(`Expected ZodObject, got ${type.constructor.name}`);
    }
  }
  return type;
}

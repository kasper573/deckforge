import type { ZodType } from "zod";
import { ZodIntersection, ZodObject } from "zod";
import { normalizeType } from "./zodNormalize";

export function zodTypeAtPath(
  type: ZodType,
  path: string[]
): ZodType | undefined {
  if (path.length === 0) {
    return type;
  }

  type = normalizeType(type);

  if (type instanceof ZodObject) {
    const [first, ...rest] = path;
    type = type.shape[first];
    if (!rest.length) {
      return type;
    }
    return zodTypeAtPath(type, rest);
  }

  if (type instanceof ZodIntersection) {
    return (
      zodTypeAtPath(type._def.left, path) ||
      zodTypeAtPath(type._def.right, path)
    );
  }

  // Should never happen (if it happens there's a flaw in the implementation)
  throw new Error(`Unsupported zod type: ${type.constructor.name}`);
}

import type { ZodType } from "zod";
import { normalizeType } from "./zodNormalize";

export function zodInstanceOf<OfType extends ZodType>(
  type: ZodType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ofType: new (...args: any[]) => OfType
): type is OfType {
  type = normalizeType(type);
  return type instanceof ofType;
}

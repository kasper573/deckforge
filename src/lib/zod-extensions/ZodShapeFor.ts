import type { ZodType } from "zod";

export type ZodShapeFor<T> = {
  [K in keyof T]: ZodType<T[K]>;
};

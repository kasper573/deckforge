import type { ZodType } from "zod";
import type { z } from "zod";

export type ZodShapeFor<T> = {
  [K in keyof T]: ZodType<T[K]>;
};

export type ZodTypesFor<T> = {
  [K in keyof T]: T[K] extends ZodType ? z.infer<T[K]> : never;
};

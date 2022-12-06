import type { ZodObject, ZodType } from "zod";

type NonObject = string | number | boolean | Date;
export type ZodShapeFor<T> = {
  [K in keyof T]: T[K] extends NonObject
    ? ZodType<T[K]>
    : ZodObject<ZodShapeFor<T[K]>>;
};

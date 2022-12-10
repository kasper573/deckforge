import * as z from "zod";
import type { ZodType } from "zod";
import type { Prisma } from "@prisma/client";

export const jsonArrayType = z.lazy<ZodType<Prisma.JsonArray>>(() =>
  z.array(jsonValueType)
);

export const jsonObjectType = z.lazy<ZodType<Prisma.JsonObject>>(() =>
  z.record(jsonValueType)
);

export const jsonPrimitiveType = z
  .string()
  .or(z.number())
  .or(z.boolean())
  .or(z.null());

export const jsonValueType: ZodType<Prisma.JsonValue> = jsonPrimitiveType
  .or(jsonArrayType)
  .or(jsonObjectType);

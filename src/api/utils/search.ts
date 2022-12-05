import type { ZodType } from "zod";
import { z } from "zod";

export function createFilterType<T extends ZodType>(filter: T) {
  return z.object({
    filter,
    offset: z.number(),
    limit: z.number(),
  });
}

export function createResultType<EntityType extends ZodType>(
  entityType: EntityType
) {
  return z.object({ total: z.number(), entities: z.array(entityType) });
}

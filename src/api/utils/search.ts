import type { ZodType } from "zod";
import { z } from "zod";

export const filterType = z.object({ offset: z.number(), limit: z.number() });

export function createResultType<EntityType extends ZodType>(
  entityType: EntityType
) {
  return z.object({ total: z.number(), entities: z.array(entityType) });
}

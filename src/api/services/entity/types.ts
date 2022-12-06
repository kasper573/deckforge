import { z } from "zod";
import { propertyType } from "../../../../prisma/zod";

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  entityId: propertyType.shape.entityId,
  name: z.string(),
});

export const propertyMutationType = propertyType.pick({
  gameId: true,
  entityId: true,
  name: true,
  typeName: true,
});

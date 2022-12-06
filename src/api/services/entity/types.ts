import { z } from "zod";
import { gameType, propertyType } from "../../../../prisma/zod";

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  gameId: gameType.shape.gameId,
  entityId: propertyType.shape.entityId,
  name: z.string(),
});

export const propertyMutationType = propertyType.pick({
  gameId: true,
  entityId: true,
  name: true,
  typeName: true,
});

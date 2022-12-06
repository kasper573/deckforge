import { z } from "zod";
import { gameType } from "../../../../prisma/zod/game";
import { propertyType } from "../../../../prisma/zod/property";

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  gameId: gameType.shape.gameId,
  entityId: propertyType.shape.entityId,
  name: z.string(),
});

export const propertyTypeNameType = z.enum(["string", "number", "boolean"]);

export const propertyMutationPayloadType = propertyType;

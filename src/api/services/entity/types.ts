import { z } from "zod";
import { gameType } from "../game/types";

export const propertyType = z.object({
  propertyId: z.string(),
  name: z.string(),
  typeName: z.string(),
  entityId: z.string(),
  gameId: z.string(),
});

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  gameId: gameType.shape.gameId,
  entityId: propertyType.shape.entityId,
  name: z.string(),
});

export const propertyTypeNameType = z.enum(["string", "number", "boolean"]);

export const propertyMutationPayloadType = propertyType;

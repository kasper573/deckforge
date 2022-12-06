import { z } from "zod";
import { gameType } from "../game/types";

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  gameId: gameType.shape.gameId,
  entityId: z.string(),
  name: z.string().min(1).max(32),
});

export const propertyTypeNameType = z.enum(["string", "number", "boolean"]);

export const propertyType = z.object({
  propertyId: z.string(),
  name: z.string().min(1).max(32),
  typeName: z.string(), // TODO use propertyTypeNameType,
  entityId: entityType.shape.entityId,
  gameId: z.string(),
});

export const propertyMutationPayloadType = propertyType;

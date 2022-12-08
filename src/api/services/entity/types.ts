import { z } from "zod";
import type { Property } from "@prisma/client";
import { gameType } from "../game/types";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";

export type EntityId = z.infer<typeof entityIdType>;
export const entityIdType = z.union([z.literal("player"), z.literal("card")]);

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  gameId: gameType.shape.gameId,
  entityId: entityIdType,
  name: z.string().min(1).max(32),
});

export const propertyTypeType = z.enum(["string", "number", "boolean"]);

export const propertyType = z.object<ZodShapeFor<Property>>({
  propertyId: z.string(),
  name: z.string().min(1).max(32),
  type: propertyTypeType,
  entityId: entityType.shape.entityId,
  gameId: z.string(),
});

export const propertyMutationPayloadType = propertyType;

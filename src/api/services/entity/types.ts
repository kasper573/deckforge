import { z } from "zod";
import type { Property } from "@prisma/client";
import { gameType } from "../game/types";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  gameId: gameType.shape.gameId,
  entityId: z.string(),
  name: z.string().min(1).max(32),
});

export const propertyTypeNameType = z.enum(["String", "Number", "Boolean"]);

export const propertyType = z.object<ZodShapeFor<Property>>({
  propertyId: z.string(),
  name: z.string().min(1).max(32),
  type: propertyTypeNameType,
  entityId: entityType.shape.entityId,
  gameId: z.string(),
});

export const propertyMutationPayloadType = propertyType;

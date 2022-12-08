import { ZodType } from "zod";
import { z } from "zod";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { EntityId } from "@prisma/client";
import type { Property } from "@prisma/client";
import { gameType } from "../game/types";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import type { NominalString } from "../../../lib/NominalString";
import { jsonPrimitiveType } from "../../utils/zodJson";

export const entityIdType = z.enum(["player", "card"]) satisfies ZodType<EntityId>;

export type Entity = z.infer<typeof entityType>;
export const entityType = z.object({
  gameId: gameType.shape.gameId,
  entityId: entityIdType,
  name: z.string().min(1).max(32),
});

export const propertyTypeType = z.enum(["string", "number", "boolean"]);

export type PropertyId = NominalString<"PropertyId">;
export const propertyIdType = zodNominalString<PropertyId>();

export const propertyType = z.object({
  propertyId: propertyIdType,
  name: z.string().min(1).max(32),
  type: propertyTypeType,
  entityId: entityType.shape.entityId,
  gameId: z.string(),
});

export type PropertyRecord = z.infer<typeof propertyRecordType>;
export const propertyRecordType = z.record(propertyType.omit({ name: true }));

export const propertyMutationPayloadType = propertyType;

export const propertyFilterType = propertyType.pick({
  entityId: true,
  gameId: true,
});

export type PropertyValues = z.infer<typeof propertyValuesType>;
export const propertyValuesType = z.record(propertyIdType, jsonPrimitiveType);

export const assertRuntimeProperty = (
  card: Property
): z.infer<typeof propertyType> => {
  const { propertyId, ...rest } = card;
  return {
    ...rest,
    propertyId: propertyId as PropertyId,
  };
};

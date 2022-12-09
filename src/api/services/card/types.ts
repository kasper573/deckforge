import * as z from "zod";
import type { Card } from "@prisma/client";
import type { PropertyValues } from "../entity/types";
import { propertyValuesType } from "../entity/types";

export const cardType = z.object({
  cardId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  code: z.string(),
  name: z.string().min(1).max(32),
  gameId: z.string(),
  deckId: z.string(),
  propertyDefaults: propertyValuesType,
});

export const cardMutationPayloadType = cardType
  .pick({ cardId: true })
  .and(
    cardType.pick({ name: true, propertyDefaults: true, code: true }).partial()
  );

export const assertRuntimeCard = (card: Card): z.infer<typeof cardType> => {
  const { propertyDefaults, ...rest } = card;
  return {
    ...rest,
    propertyDefaults: propertyDefaults as PropertyValues,
  };
};

import produce from "immer";
import { Prisma } from "../../db";
import type { DatabaseClient } from "../../db";
import type { PropertyId, PropertyValues } from "../entity/types";

export async function updateCardPropertyDefaults(
  db: DatabaseClient,
  propertyId: PropertyId,
  createUpdatedDefaults: (defaults: PropertyValues) => void
) {
  const cards = await db.card.findMany({
    where: {
      propertyDefaults: {
        path: `$.${propertyId}`,
        not: Prisma.JsonNull,
      },
    },
    select: {
      cardId: true,
      propertyDefaults: true,
    },
  });

  await db.$transaction(
    cards.map(({ cardId, propertyDefaults }) =>
      db.card.update({
        where: { cardId },
        data: {
          propertyDefaults: produce(
            propertyDefaults as PropertyValues,
            createUpdatedDefaults
          ),
        },
      })
    )
  );
}

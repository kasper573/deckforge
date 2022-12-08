import type { Property } from "@prisma/client";
import { z } from "zod";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { assertGameAccess } from "../game/service";
import { gameType } from "../game/types";
import { updateCardPropertyDefaults } from "../card/updateCardPropertyDefaults";
import type { PropertyRecord } from "./types";
import {
  assertRuntimeProperty,
  defaultPropertyValue,
  entityType,
  propertyMutationPayloadType,
  propertyRecordType,
  propertyType,
} from "./types";

export type EntityService = ReturnType<typeof createEntityService>;

export function createEntityService() {
  return t.router({
    listEntities: t.procedure
      .input(gameType.pick({ gameId: true }))
      .output(z.array(entityType))
      .query(({ input: { gameId } }) => [
        { entityId: "player", name: "Player", gameId },
        { entityId: "card", name: "Card", gameId },
      ]),
    createProperty: t.procedure
      .input(propertyMutationPayloadType.omit({ propertyId: true }))
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(async ({ input: data, ctx }) => {
        await ctx.db.property.create({ data });
      }),
    updateProperty: t.procedure
      .input(propertyMutationPayloadType)
      .use((opts) => assertPropertyAccess(opts, opts.input.propertyId))
      .mutation(async ({ input: { propertyId, ...data }, ctx: { db } }) => {
        await db.property.update({
          where: { propertyId },
          data,
        });

        await updateCardPropertyDefaults(db, propertyId, (defaults) => {
          defaults[propertyId] = defaultPropertyValue(data.type);
        });
      }),
    deleteProperty: t.procedure
      .input(propertyType.shape.propertyId)
      .use((opts) => assertPropertyAccess(opts, opts.input))
      .mutation(async ({ input: propertyId, ctx: { db } }) => {
        await db.property.delete({ where: { propertyId } });
        await updateCardPropertyDefaults(db, propertyId, (defaults) => {
          delete defaults[propertyId];
        });
      }),
    properties: t.procedure
      .input(propertyType.pick({ entityId: true, gameId: true }))
      .output(propertyRecordType)
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .query(async ({ input: where, ctx: { db } }) => {
        const properties = await db.property.findMany({ where });
        return properties.reduce(
          (record, prop) => ({
            ...record,
            [prop.name]: assertRuntimeProperty(prop),
          }),
          {} as PropertyRecord
        );
      }),
  });
}

export async function assertPropertyAccess<Input>(
  opts: MiddlewareOptions,
  propertyId: Property["propertyId"]
) {
  const entity = await opts.ctx.db.property.findUnique({
    where: { propertyId },
    select: { gameId: true },
  });
  return assertGameAccess(opts, entity?.gameId);
}

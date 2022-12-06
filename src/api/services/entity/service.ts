import type { Property } from "@prisma/client";
import { z } from "zod";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { createFilterType, createResultType } from "../../utils/search";
import { gameType, propertyType } from "../../../../prisma/zod";
import { assertGameAccess } from "../game/service";
import { entityType, propertyMutationPayloadType } from "./types";

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
      .output(propertyType)
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(({ input: data, ctx }) => ctx.db.property.create({ data })),
    updateProperty: t.procedure
      .input(propertyMutationPayloadType)
      .use((opts) => assertPropertyAccess(opts, opts.input.propertyId))
      .mutation(async ({ input: { propertyId, ...data }, ctx }) => {
        await ctx.db.property.update({
          where: { propertyId },
          data,
        });
      }),
    deleteProperty: t.procedure
      .input(propertyType.shape.propertyId)
      .use((opts) => assertPropertyAccess(opts, opts.input))
      .mutation(async ({ input: propertyId, ctx }) => {
        await ctx.db.property.delete({ where: { propertyId } });
      }),
    listProperties: t.procedure
      .input(
        createFilterType(propertyType.pick({ entityId: true, gameId: true }))
      )
      .output(createResultType(propertyType))
      .use((opts) => assertGameAccess(opts, opts.input.filter.gameId))
      .query(
        async ({ input: { filter: where, offset, limit }, ctx: { db } }) => {
          const [total, entities] = await Promise.all([
            db.property.count({ where }),
            db.property.findMany({ take: limit, skip: offset, where }),
          ]);
          return { total, entities };
        }
      ),
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

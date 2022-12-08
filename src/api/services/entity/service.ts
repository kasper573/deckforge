import type { Property } from "@prisma/client";
import { z } from "zod";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { assertGameAccess } from "../game/service";
import { gameType } from "../game/types";
import { entityType, propertyMutationPayloadType, propertyType } from "./types";

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
      .mutation(async ({ input: propertyId, ctx }) =>
        ctx.db.property.delete({ where: { propertyId } })
      ),
    listProperties: t.procedure
      .input(propertyType.pick({ entityId: true, gameId: true }))
      .output(z.array(propertyType))
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .query(({ input: where, ctx: { db } }) =>
        db.property.findMany({ where })
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

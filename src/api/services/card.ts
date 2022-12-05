import { z } from "zod";
import type { Card } from "@prisma/client";
import type { MiddlewareOptions } from "../trpc";
import { t } from "../trpc";
import { createFilterType, createResultType } from "../utils/search";
import { cardType, gameType } from "../../../prisma/zod";
import { UserFacingError } from "../utils/UserFacingError";
import { assertDeckAccess } from "./deck";
import { assertGameAccess } from "./game";

export type CardService = ReturnType<typeof createCardService>;

export function createCardService() {
  return t.router({
    create: t.procedure
      .input(cardType.pick({ name: true, deckId: true, gameId: true }))
      .output(cardType)
      .use((opts) => assertDeckAccess(opts, opts.input.deckId))
      .mutation(({ input: data, ctx }) => ctx.db.card.create({ data })),
    read: t.procedure
      .input(cardType.shape.id)
      .output(cardType)
      .use((opts) => assertCardAccess(opts, opts.input))
      .query(async ({ input: id, ctx }) => {
        const card = await ctx.db.card.findUnique({ where: { id } });
        if (!card) {
          throw new UserFacingError("Card not found");
        }
        return card;
      }),
    rename: t.procedure
      .input(cardType.pick({ id: true, name: true }))
      .use((opts) => assertCardAccess(opts, opts.input.id))
      .mutation(async ({ input: { id, name }, ctx }) => {
        await ctx.db.card.update({
          where: { id },
          data: { name },
        });
      }),
    delete: t.procedure
      .input(cardType.shape.id)
      .use((opts) => assertCardAccess(opts, opts.input))
      .mutation(async ({ input: id, ctx }) => {
        await ctx.db.card.delete({ where: { id } });
      }),
    list: t.procedure
      .input(createFilterType(z.object({ deckId: gameType.shape.id })))
      .output(createResultType(cardType))
      .use((opts) => assertDeckAccess(opts, opts.input.filter.deckId))
      .query(
        async ({
          input: {
            filter: { deckId },
            offset,
            limit,
          },
          ctx: { db },
        }) => {
          const where = { deckId };
          const [total, entities] = await Promise.all([
            db.card.count({ where }),
            db.card.findMany({ take: limit, skip: offset, where }),
          ]);
          return { total, entities };
        }
      ),
  });
}

export async function assertCardAccess<Input>(
  opts: MiddlewareOptions,
  id: Card["id"]
) {
  const card = await opts.ctx.db.card.findUnique({
    where: { id },
    select: { gameId: true },
  });
  console.log("assertCardAccess", { card });
  return assertGameAccess(opts, card?.gameId);
}

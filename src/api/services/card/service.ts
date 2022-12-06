import type { Card } from "@prisma/client";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { createFilterType, createResultType } from "../../utils/search";
import { cardType } from "../../../../prisma/zod/card";
import { deckType } from "../deck/types";
import { UserFacingError } from "../../utils/UserFacingError";
import { assertDeckAccess } from "../deck/service";
import { assertGameAccess } from "../game/service";

export type CardService = ReturnType<typeof createCardService>;

export function createCardService() {
  return t.router({
    create: t.procedure
      .input(cardType.pick({ name: true, deckId: true, gameId: true }))
      .output(cardType)
      .use((opts) => assertDeckAccess(opts, opts.input.deckId))
      .mutation(({ input: data, ctx }) => ctx.db.card.create({ data })),
    read: t.procedure
      .input(cardType.shape.cardId)
      .output(cardType)
      .use((opts) => assertCardAccess(opts, opts.input))
      .query(async ({ input: cardId, ctx }) => {
        const card = await ctx.db.card.findUnique({ where: { cardId } });
        if (!card) {
          throw new UserFacingError("Card not found");
        }
        return card;
      }),
    rename: t.procedure
      .input(cardType.pick({ cardId: true, name: true }))
      .use((opts) => assertCardAccess(opts, opts.input.cardId))
      .mutation(async ({ input: { cardId, name }, ctx }) => {
        await ctx.db.card.update({
          where: { cardId },
          data: { name },
        });
      }),
    delete: t.procedure
      .input(cardType.shape.cardId)
      .use((opts) => assertCardAccess(opts, opts.input))
      .mutation(async ({ input: cardId, ctx }) => {
        await ctx.db.card.delete({ where: { cardId } });
      }),
    list: t.procedure
      .input(createFilterType(deckType.pick({ deckId: true })))
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
  cardId: Card["cardId"]
) {
  const card = await opts.ctx.db.card.findUnique({
    where: { cardId },
    select: { gameId: true },
  });
  return assertGameAccess(opts, card?.gameId);
}

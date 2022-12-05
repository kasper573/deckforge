import { z } from "zod";
import type { Deck } from "@prisma/client";
import type { MiddlewareOptions } from "../trpc";
import { t } from "../trpc";
import { createFilterType, createResultType } from "../utils/search";
import { deckType, gameType } from "../../../prisma/zod";
import { UserFacingError } from "../utils/UserFacingError";
import { assertGameAccess } from "./game";

export type DeckService = ReturnType<typeof createDeckService>;
export function createDeckService() {
  return t.router({
    create: t.procedure
      .input(z.object({ name: z.string(), gameId: gameType.shape.id }))
      .output(deckType)
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(({ input: data, ctx }) => ctx.db.deck.create({ data })),
    rename: t.procedure
      .input(deckType.pick({ id: true, name: true }))
      .use((opts) => assertDeckAccess(opts, opts.input.id))
      .mutation(async ({ input: { id, name }, ctx }) => {
        await ctx.db.deck.update({
          where: { id },
          data: { name },
        });
      }),
    delete: t.procedure
      .input(deckType.shape.id)
      .use((opts) => assertDeckAccess(opts, opts.input))
      .mutation(async ({ input: id, ctx }) => {
        await ctx.db.deck.delete({ where: { id } });
      }),
    read: t.procedure
      .input(deckType.shape.id)
      .output(deckType)
      .use((opts) => assertDeckAccess(opts, opts.input))
      .query(async ({ input: id, ctx }) => {
        const deck = await ctx.db.deck.findUnique({ where: { id } });
        if (!deck) {
          throw new UserFacingError("Deck not found");
        }
        return deck;
      }),
    list: t.procedure
      .input(createFilterType(z.object({ gameId: gameType.shape.id })))
      .output(createResultType(deckType))
      .use((opts) => assertGameAccess(opts, opts.input.filter.gameId))
      .query(
        async ({
          input: {
            filter: { gameId },
            offset,
            limit,
          },
          ctx: { db },
        }) => {
          const where = { gameId };
          const [total, entities] = await Promise.all([
            db.deck.count({ where }),
            db.deck.findMany({ take: limit, skip: offset, where }),
          ]);
          return { total, entities };
        }
      ),
  });
}

export async function assertDeckAccess<Input>(
  opts: MiddlewareOptions,
  id: Deck["id"]
) {
  const deck = await opts.ctx.db.deck.findUnique({
    where: { id },
    select: { gameId: true },
  });
  return assertGameAccess(opts, deck?.gameId);
}

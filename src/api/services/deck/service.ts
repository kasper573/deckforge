import type { Deck } from "@prisma/client";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { createFilterType, createResultType } from "../../utils/search";
import { deckType, gameType } from "../../../../prisma/zod";
import { UserFacingError } from "../../utils/UserFacingError";
import { assertGameAccess } from "../game/service";

export type DeckService = ReturnType<typeof createDeckService>;

export function createDeckService() {
  return t.router({
    create: t.procedure
      .input(deckType.pick({ name: true, gameId: true }))
      .output(deckType)
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(({ input: data, ctx }) => ctx.db.deck.create({ data })),
    read: t.procedure
      .input(deckType.shape.deckId)
      .output(deckType)
      .use((opts) => assertDeckAccess(opts, opts.input))
      .query(async ({ input: deckId, ctx }) => {
        const deck = await ctx.db.deck.findUnique({ where: { deckId } });
        if (!deck) {
          throw new UserFacingError("Deck not found");
        }
        return deck;
      }),
    rename: t.procedure
      .input(deckType.pick({ deckId: true, name: true }))
      .use((opts) => assertDeckAccess(opts, opts.input.deckId))
      .mutation(async ({ input: { deckId, name }, ctx }) => {
        await ctx.db.deck.update({
          where: { deckId },
          data: { name },
        });
      }),
    delete: t.procedure
      .input(deckType.shape.deckId)
      .use((opts) => assertDeckAccess(opts, opts.input))
      .mutation(async ({ input: deckId, ctx }) => {
        await ctx.db.deck.delete({ where: { deckId } });
      }),
    list: t.procedure
      .input(createFilterType(gameType.pick({ gameId: true })))
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
  deckId?: Deck["deckId"]
) {
  const deck =
    deckId !== undefined
      ? await opts.ctx.db.deck.findUnique({
          where: { deckId },
          select: { gameId: true },
        })
      : undefined;
  return assertGameAccess(opts, deck?.gameId);
}

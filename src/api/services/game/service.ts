import { z } from "zod";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { createFilterType, createResultType } from "../../utils/search";
import { UserFacingError } from "../../utils/UserFacingError";
import type { Game } from "./types";
import { gameType } from "./types";

export type GameService = ReturnType<typeof createGameService>;

export function createGameService() {
  return t.router({
    create: t.procedure
      .use(access())
      .input(gameType.pick({ name: true, definition: true }))
      .mutation(async ({ input, ctx }) => {
        await ctx.db.game.create({
          data: { ownerId: ctx.user.userId, ...input },
        });
      }),
    read: t.procedure
      .input(gameType.shape.gameId)
      .use((opts) => assertGameAccess(opts, opts.input))
      .output(gameType)
      .query(async ({ input: gameId, ctx }) => {
        const game = await ctx.db.game.findUnique({ where: { gameId } });
        if (!game) {
          throw new UserFacingError("Game not found");
        }
        return game as unknown as Game;
      }),
    update: t.procedure
      .input(
        gameType
          .pick({ gameId: true })
          .and(gameType.pick({ name: true, definition: true }).partial())
      )
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(async ({ input: { gameId, ...data }, ctx }) => {
        await ctx.db.game.update({
          where: { gameId },
          data,
        });
      }),
    delete: t.procedure
      .input(gameType.shape.gameId)
      .use((opts) => assertGameAccess(opts, opts.input))
      .mutation(async ({ input: gameId, ctx }) => {
        await ctx.db.game.delete({ where: { gameId } });
      }),
    list: t.procedure
      .input(createFilterType(z.unknown().optional()))
      .use(access())
      .output(createResultType(gameType.omit({ definition: true })))
      .query(async ({ input: { offset, limit }, ctx: { db, user } }) => {
        const [total, entities] = await Promise.all([
          db.game.count({ where: { ownerId: user.userId } }),
          db.game.findMany({
            take: limit,
            skip: offset,
            where: { ownerId: user.userId },
          }),
        ]);
        return { total, entities: entities as unknown as Game[] };
      }),
  });
}

export async function assertGameAccess<Input>(
  { ctx, next }: MiddlewareOptions,
  gameId?: Game["gameId"]
) {
  const game =
    gameId !== undefined
      ? await ctx.db.game.findUnique({
          where: { gameId },
          select: { ownerId: true },
        })
      : undefined;
  if (!ctx.user || game?.ownerId !== ctx.user.userId) {
    throw new UserFacingError("You do not have access to this game");
  }
  return next({ ctx: { auth: ctx.user } });
}

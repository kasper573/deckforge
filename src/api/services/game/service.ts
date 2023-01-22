import { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { createFilterType, createResultType } from "../../utils/search";
import { UserFacingError } from "../../utils/UserFacingError";
import { isUniqueConstraintError } from "../../utils/isUniqueConstraintError";
import type { Game } from "./types";
import { gameType } from "./types";

export type GameService = ReturnType<typeof createGameService>;

export function createGameService() {
  return t.router({
    create: t.procedure
      .use(access())
      .input(gameType.pick({ name: true, definition: true, type: true }))
      .output(gameType)
      .mutation(async ({ input: { definition, ...rest }, ctx }) => {
        try {
          const game = await ctx.db.game.create({
            data: {
              ...rest,
              ownerId: ctx.user.userId,
              definition: definition as Prisma.JsonObject,
            },
          });
          return game as unknown as Game;
        } catch (e) {
          if (isUniqueConstraintError(e)) {
            throw new UserFacingError("A game with this name already exists");
          }
          throw e;
        }
      }),
    read: t.procedure
      .input(gameType.shape.gameId)
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
      .mutation(async ({ input: { gameId, definition, ...data }, ctx }) => {
        try {
          await ctx.db.game.update({
            where: { gameId },
            data: {
              ...data,
              definition: definition as Prisma.JsonObject,
            },
          });
        } catch (e) {
          if (isUniqueConstraintError(e)) {
            throw new UserFacingError("A game with this name already exists");
          }
        }
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

import { z } from "zod";
import type { Game } from "@prisma/client";
import type { MiddlewareOptions } from "../trpc";
import { t } from "../trpc";
import { access } from "../middlewares/access";
import { createFilterType, createResultType } from "../utils/search";
import { gameType } from "../../../prisma/zod";
import { UserFacingError } from "../utils/UserFacingError";

export type GameService = ReturnType<typeof createGameService>;

export function createGameService() {
  return t.router({
    create: t.procedure
      .use(access())
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input: data, ctx }) => {
        await ctx.db.game.create({ data: { ...data, ownerId: ctx.user.id } });
      }),
    rename: t.procedure
      .input(gameType.pick({ id: true, name: true }))
      .use((opts) => assertGameAccess(opts, opts.input.id))
      .mutation(async ({ input: { id, name }, ctx }) => {
        await ctx.db.game.update({
          where: { id },
          data: { name },
        });
      }),
    delete: t.procedure
      .input(gameType.shape.id)
      .use((opts) => assertGameAccess(opts, opts.input))
      .mutation(async ({ input: id, ctx }) => {
        await ctx.db.game.delete({ where: { id } });
      }),
    read: t.procedure
      .use(access())
      .input(gameType.shape.id)
      .output(gameType)
      .query(async ({ input: id, ctx }) => {
        const game = await ctx.db.game.findUnique({ where: { id } });
        if (!game) {
          throw new UserFacingError("Game not found");
        }
        return game;
      }),
    list: t.procedure
      .input(createFilterType(z.unknown().optional()))
      .use(access())
      .output(createResultType(gameType))
      .query(async ({ input: { offset, limit }, ctx: { db, user } }) => {
        const [total, entities] = await Promise.all([
          db.game.count({ where: { ownerId: user.id } }),
          db.game.findMany({
            take: limit,
            skip: offset,
            where: { ownerId: user.id },
          }),
        ]);
        return { total, entities };
      }),
  });
}

export async function assertGameAccess<Input>(
  { ctx, next }: MiddlewareOptions,
  id?: Game["id"]
) {
  const game =
    id !== undefined
      ? await ctx.db.game.findUnique({
          where: { id },
          select: { ownerId: true },
        })
      : undefined;
  if (!ctx.user || game?.ownerId !== ctx.user.id) {
    throw new UserFacingError("You do not have access to this game");
  }
  return next({ ctx: { auth: ctx.user } });
}

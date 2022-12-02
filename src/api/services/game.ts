import { z } from "zod";
import type { Game } from "@prisma/client";
import { t } from "../trpc";
import { access } from "../middlewares/access";
import { createResultType, filterType } from "../utils/search";
import { gameType } from "../../../prisma/zod";
import { UserFacingError } from "../utils/UserFacingError";

export type GameService = ReturnType<typeof createGameService>;
export function createGameService() {
  return t.router({
    create: t.procedure
      .use(access())
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input: data, ctx }) => {
        await ctx.db.game.create({ data: { ...data, userId: ctx.user.id } });
      }),
    rename: t.procedure
      .input(gameType.pick({ id: true, name: true }))
      .use(assertGameAccess((input: { id: string }) => input.id))
      .mutation(async ({ input: { id, name }, ctx }) => {
        await ctx.db.game.update({
          where: { id },
          data: { name },
        });
      }),
    delete: t.procedure
      .input(gameType.shape.id)
      .use(assertGameAccess((input: string) => input))
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
    myGameList: t.procedure
      .input(filterType)
      .use(access())
      .output(createResultType(gameType))
      .query(async ({ input: { offset, limit }, ctx: { db, user } }) => {
        const [total, entities] = await Promise.all([
          db.game.count({ where: { userId: user.id } }),
          db.game.findMany({
            take: limit,
            skip: offset,
            where: { userId: user.id },
          }),
        ]);
        return { total, entities };
      }),
  });
}

function assertGameAccess<Input>(selectId: (input: Input) => Game["id"]) {
  return t.middleware(async ({ ctx, input, next }) => {
    const id = selectId(input as Input);
    const game = await ctx.db.game.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!ctx.user || game?.userId !== ctx.user.id) {
      throw new UserFacingError(
        "You do not have permission to delete this game."
      );
    }
    return next({ ctx: { auth: ctx.user } });
  });
}

import { z } from "zod";
import type { Game } from "@prisma/client";
import { t } from "../trpc";
import { access } from "../middlewares/access";
import { createResultType, filterType } from "../utils/search";
import { gameType } from "../../../prisma/zod";
import { UserFacingError } from "../utils/UserFacingError";

export const gameService = t.router({
  create: t.procedure
    .use(access())
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input: data, ctx }) => {
      await ctx.prisma.game.create({ data: { ...data, userId: ctx.auth.id } });
    }),
  rename: t.procedure
    .input(gameType.pick({ id: true, name: true }))
    .use(assertGameAccess((input: { id: string }) => input.id))
    .mutation(async ({ input: { id, name }, ctx }) => {
      await ctx.prisma.game.update({
        where: { id },
        data: { name },
      });
    }),
  delete: t.procedure
    .input(gameType.shape.id)
    .use(assertGameAccess((input: string) => input))
    .mutation(async ({ input: id, ctx }) => {
      await ctx.prisma.game.delete({ where: { id } });
    }),
  read: t.procedure
    .use(access())
    .input(gameType.shape.id)
    .output(gameType)
    .query(async ({ input: id, ctx }) => {
      const game = await ctx.prisma.game.findUnique({ where: { id } });
      if (!game) {
        throw new UserFacingError("Game not found");
      }
      return game;
    }),
  myGameList: t.procedure
    .input(filterType)
    .use(access())
    .output(createResultType(gameType))
    .query(async ({ input: { offset, limit }, ctx: { prisma, auth } }) => {
      const [total, entities] = await Promise.all([
        prisma.game.count(),
        prisma.game.findMany({
          take: limit,
          skip: offset,
          where: { userId: auth.id },
        }),
      ]);
      return { total, entities };
    }),
});

function assertGameAccess<Input>(selectId: (input: Input) => Game["id"]) {
  return t.middleware(async ({ ctx, input, next }) => {
    const id = selectId(input as Input);
    const game = await ctx.prisma.game.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!ctx.auth || game?.userId !== ctx.auth.id) {
      throw new UserFacingError(
        "You do not have permission to delete this game."
      );
    }
    return next({ ctx: { auth: ctx.auth } });
  });
}

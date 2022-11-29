import { z } from "zod";
import { t } from "../trpc";
import { access } from "../middlewares/access";
import { createResultType, filterType } from "../utils/search";
import { gameType } from "../../../prisma/zod";

export const gameService = t.router({
  create: t.procedure
    .use(access())
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input: data, ctx }) => {
      await ctx.prisma.game.create({ data: { ...data, userId: ctx.auth.id } });
    }),
  list: t.procedure
    .use(access())
    .input(filterType)
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

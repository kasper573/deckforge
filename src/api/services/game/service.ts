import { z } from "zod";
import type { Prisma, Game as PrismaGame } from "@prisma/client";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserFacingError } from "../../utils/UserFacingError";
import { isUniqueConstraintError } from "../../utils/isUniqueConstraintError";
import { userType } from "../user/types";
import type { Game } from "./types";
import { gameType } from "./types";
import { gameSlug } from "./slug";

export type GameService = ReturnType<typeof createGameService>;

export function createGameService({
  maxGamesPerUser,
}: {
  maxGamesPerUser: number;
}) {
  return t.router({
    create: t.procedure
      .use(access())
      .input(gameType.pick({ name: true, definition: true, type: true }))
      .output(gameType)
      .mutation(
        async ({ input: { definition, ...rest }, ctx: { db, user } }) => {
          const count = await db.game.count({
            where: { ownerId: user.userId },
          });
          if (count >= maxGamesPerUser) {
            throw new UserFacingError(
              `You can not have more than ${maxGamesPerUser} games per account`
            );
          }

          try {
            const game = await db.game.create({
              data: {
                ...rest,
                ownerId: user.userId,
                definition: definition as Prisma.JsonObject,
                slug: gameSlug(rest.name),
              },
            });
            return game as unknown as Game;
          } catch (e) {
            if (isUniqueConstraintError(e)) {
              throw new UserFacingError("A game with this name already exists");
            }
            throw e;
          }
        }
      ),
    read: t.procedure
      .input(
        z.discriminatedUnion("type", [
          z.object({
            type: z.literal("gameId"),
            gameId: gameType.shape.gameId,
          }),
          z.object({
            type: z.literal("slug"),
            owner: userType.shape.name,
            slug: gameType.shape.slug,
          }),
        ])
      )
      .output(gameType)
      .query(async ({ input, ctx }) => {
        let game: PrismaGame;
        try {
          switch (input.type) {
            case "gameId":
              game = await ctx.db.game.findUniqueOrThrow({
                where: { gameId: input.gameId },
              });
              break;
            case "slug":
              const { userId } = await ctx.db.user.findUniqueOrThrow({
                where: { name: input.owner },
                select: { userId: true },
              });
              game = await ctx.db.game.findFirstOrThrow({
                where: { slug: input.slug, ownerId: userId },
              });
              break;
          }
        } catch {
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
              slug: data.name !== undefined ? gameSlug(data.name) : undefined,
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
      .use(access())
      .output(z.array(gameType.omit({ definition: true })))
      .query(async ({ ctx: { db, user } }) => {
        const games = db.game.findMany({ where: { ownerId: user.userId } });
        return games as unknown as Game[];
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

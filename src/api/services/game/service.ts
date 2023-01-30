import { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { access } from "../../middlewares/access";
import { UserFacingError } from "../../utils/UserFacingError";
import { isUniqueConstraintError } from "../../utils/isUniqueConstraintError";
import type { DatabaseClient } from "../../db";
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
                slug: await resolveGameSlug(db, user.userId, rest.name),
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
            slug: gameType.shape.slug,
          }),
        ])
      )
      .output(gameType)
      .query(async ({ input, ctx }) => {
        const game = await ctx.db.game.findUnique({
          where:
            input.type === "gameId"
              ? { gameId: input.gameId }
              : { slug: input.slug },
        });

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
      .output(gameType)
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(
        async ({
          input: { gameId, definition, ...data },
          ctx: { db, user },
        }) => {
          try {
            const game = await db.game.update({
              where: { gameId },
              data: {
                ...data,
                definition: definition as Prisma.JsonObject,
                slug: data.name
                  ? await resolveGameSlug(db, user.userId, data.name)
                  : undefined,
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

async function resolveGameSlug(
  db: DatabaseClient,
  userId: string,
  gameName: string
) {
  const { name: ownerName } = await db.user.findUniqueOrThrow({
    where: { userId },
    select: { name: true },
  });

  return gameSlug(ownerName, gameName);
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
  return next({ ctx: { user: ctx.user } });
}

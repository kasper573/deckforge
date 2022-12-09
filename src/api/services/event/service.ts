import { z } from "zod";
import type { Reaction } from "@prisma/client";
import type { Action } from "@prisma/client";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { assertGameAccess } from "../game/service";
import { actionType, reactionType } from "./types";
export type EventService = ReturnType<typeof createEventService>;

export function createEventService() {
  return t.router({
    action: t.procedure
      .input(actionType.shape.actionId)
      .use((opts) => assertActionAccess(opts, opts.input))
      .output(actionType)
      .query(({ ctx: { db }, input: actionId }) =>
        db.action.findUniqueOrThrow({ where: { actionId } })
      ),
    actions: t.procedure
      .input(actionType.shape.gameId)
      .use((opts) => assertGameAccess(opts, opts.input))
      .output(z.array(actionType))
      .query(({ ctx: { db }, input: gameId }) =>
        db.action.findMany({ where: { gameId } })
      ),
    reaction: t.procedure
      .input(reactionType.shape.reactionId)
      .use((opts) => assertReactionAccess(opts, opts.input))
      .output(reactionType)
      .query(({ ctx: { db }, input: reactionId }) =>
        db.reaction.findUniqueOrThrow({ where: { reactionId } })
      ),
    reactions: t.procedure
      .input(actionType.shape.actionId)
      .use((opts) => assertActionAccess(opts, opts.input))
      .output(z.array(reactionType))
      .query(({ ctx: { db }, input: actionId }) =>
        db.reaction.findMany({ where: { actionId } })
      ),
    createAction: t.procedure
      .input(actionType.omit({ actionId: true }))
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(({ input, ctx: { db } }) => db.action.create({ data: input })),
    updateAction: t.procedure
      .input(
        actionType
          .pick({ actionId: true })
          .and(actionType.omit({ actionId: true }).partial())
      )
      .use((opts) => assertActionAccess(opts, opts.input.actionId))
      .mutation(({ input: { actionId, ...data }, ctx: { db } }) =>
        db.action.update({ data, where: { actionId } })
      ),
    deleteAction: t.procedure
      .input(actionType.shape.actionId)
      .use((opts) => assertActionAccess(opts, opts.input))
      .mutation(({ input: actionId, ctx: { db } }) =>
        db.action.delete({ where: { actionId } })
      ),
    createReaction: t.procedure
      .input(reactionType.omit({ reactionId: true }))
      .use((opts) => assertActionAccess(opts, opts.input.actionId))
      .mutation(({ input, ctx: { db } }) =>
        db.reaction.create({ data: input })
      ),
    updateReaction: t.procedure
      .input(
        reactionType
          .pick({ reactionId: true })
          .and(reactionType.omit({ reactionId: true }).partial())
      )
      .use((opts) => assertReactionAccess(opts, opts.input.reactionId))
      .mutation(({ input: { reactionId, ...data }, ctx: { db } }) =>
        db.reaction.update({ data, where: { reactionId } })
      ),
    deleteReaction: t.procedure
      .input(reactionType.shape.reactionId)
      .use((opts) => assertReactionAccess(opts, opts.input))
      .mutation(({ input: reactionId, ctx: { db } }) =>
        db.reaction.delete({ where: { reactionId } })
      ),
  });
}

export async function assertActionAccess<Input>(
  opts: MiddlewareOptions,
  actionId?: Action["actionId"]
) {
  const action =
    actionId !== undefined
      ? await opts.ctx.db.action.findUnique({
          where: { actionId },
          select: { gameId: true },
        })
      : undefined;
  return assertGameAccess(opts, action?.gameId);
}

export async function assertReactionAccess<Input>(
  opts: MiddlewareOptions,
  reactionId?: Reaction["reactionId"]
) {
  const reaction =
    reactionId !== undefined
      ? await opts.ctx.db.reaction.findUnique({
          where: { reactionId },
          select: { actionId: true },
        })
      : undefined;
  return assertActionAccess(opts, reaction?.actionId);
}

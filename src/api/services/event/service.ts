import { z } from "zod";
import type { Reaction } from "@prisma/client";
import type { MiddlewareOptions } from "../../trpc";
import { t } from "../../trpc";
import { assertGameAccess } from "../game/service";
import { actionType, reactionType } from "./types";
export type EventService = ReturnType<typeof createEventService>;

export function createEventService() {
  return t.router({
    createAction: t.procedure
      .input(actionType.omit({ actionId: true }))
      .use((opts) => assertGameAccess(opts, opts.input.gameId))
      .mutation(({ input, ctx: { db } }) => db.action.create({ data: input })),
    actions: t.procedure
      .input(actionType.shape.gameId)
      .use((opts) => assertGameAccess(opts, opts.input))
      .output(z.array(actionType))
      .query(({ ctx: { db }, input: gameId }) =>
        db.action.findMany({ where: { gameId } })
      ),
    reactions: t.procedure
      .input(actionType.shape.actionId)
      .use((opts) => assertActionAccess(opts, opts.input))
      .output(z.array(reactionType))
      .query(({ ctx: { db }, input: actionId }) =>
        db.reaction.findMany({ where: { actionId } })
      ),
  });
}

export async function assertActionAccess<Input>(
  opts: MiddlewareOptions,
  actionId?: Reaction["actionId"]
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

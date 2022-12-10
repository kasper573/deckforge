import { z } from "zod";
import type { Action, Reaction } from "@prisma/client";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";
import { gameType } from "../game/types";
import { codeType } from "../../utils/codeType";

export const actionType = z.object<ZodShapeFor<Action>>({
  actionId: z.string(),
  name: z.string().min(1).max(32),
  gameId: gameType.shape.gameId,
  code: codeType,
});

export const reactionType = z.object<ZodShapeFor<Reaction>>({
  reactionId: z.string(),
  name: z.string().min(1).max(32),
  actionId: actionType.shape.actionId,
  code: codeType,
});

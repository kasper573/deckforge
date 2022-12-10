import { z } from "zod";
import type { Game } from "@prisma/client";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";

export const gameType = z.object<ZodShapeFor<Game>>({
  gameId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(32),
  ownerId: z.string(),
});

import * as z from "zod";
import type { Deck } from "@prisma/client";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";

export const deckType = z.object<ZodShapeFor<Deck>>({
  deckId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(32),
  gameId: z.string(),
});

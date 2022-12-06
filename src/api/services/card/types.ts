import * as z from "zod";
import type { Card } from "@prisma/client";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";

export const cardType = z.object<ZodShapeFor<Card>>({
  cardId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(32),
  gameId: z.string(),
  deckId: z.string(),
});

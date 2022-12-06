import * as z from "zod";

export const deckType = z.object({
  deckId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(32),
  gameId: z.string(),
});

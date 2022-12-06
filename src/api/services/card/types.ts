import * as z from "zod";

export const cardType = z.object({
  cardId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string().min(1).max(32),
  gameId: z.string(),
  deckId: z.string(),
});

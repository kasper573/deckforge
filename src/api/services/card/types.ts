import * as z from "zod"

export const cardType = z.object({
  cardId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  gameId: z.string(),
  deckId: z.string(),
})

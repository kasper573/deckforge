import * as z from "zod"

export const deckType = z.object({
  deckId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  gameId: z.string(),
})

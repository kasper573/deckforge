import * as z from "zod"

export const gameType = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  name: z.string(),
})

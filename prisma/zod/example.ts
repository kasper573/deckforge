import * as z from "zod"

export const exampleType = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

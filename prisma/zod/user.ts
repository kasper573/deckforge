import * as z from "zod"

export const userType = z.object({
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  accessLevel: z.number().int(),
})

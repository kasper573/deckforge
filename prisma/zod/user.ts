import * as z from "zod"
import { CompleteGame, relatedGameType } from "./index"

export const userType = z.object({
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  email: z.string(),
  passwordHash: z.string(),
  accessLevel: z.number().int(),
})

export interface CompleteUser extends z.infer<typeof userType> {
  games: CompleteGame[]
}

/**
 * relatedUserType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserType: z.ZodSchema<CompleteUser> = z.lazy(() => userType.extend({
  games: relatedGameType.array(),
}))

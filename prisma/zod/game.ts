import { z } from "zod"
import { CompleteUser, relatedUserType } from "./index"

export const gameType = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  ownerId: z.string(),
})

export interface CompleteGame extends z.infer<typeof gameType> {
  owner: CompleteUser
}

/**
 * relatedGameType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedGameType: z.ZodSchema<CompleteGame> = z.lazy(() => gameType.extend({
  owner: relatedUserType,
}))

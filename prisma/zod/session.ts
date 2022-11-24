import * as z from "zod"
import { CompleteUser, relatedUserType } from "./index"

export const sessionType = z.object({
  id: z.string(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.date(),
})

export interface CompleteSession extends z.infer<typeof sessionType> {
  user: CompleteUser
}

/**
 * relatedSessionType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedSessionType: z.ZodSchema<CompleteSession> = z.lazy(() => sessionType.extend({
  user: relatedUserType,
}))

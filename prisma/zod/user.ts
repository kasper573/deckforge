import * as z from "zod"
import { UserRole } from "@prisma/client"
import { CompleteAccount, relatedAccountType, CompleteSession, relatedSessionType } from "./index"

export const userType = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  emailVerified: z.date().nullish(),
  image: z.string().nullish(),
  role: z.nativeEnum(UserRole),
})

export interface CompleteUser extends z.infer<typeof userType> {
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
}

/**
 * relatedUserType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedUserType: z.ZodSchema<CompleteUser> = z.lazy(() => userType.extend({
  accounts: relatedAccountType.array(),
  sessions: relatedSessionType.array(),
}))

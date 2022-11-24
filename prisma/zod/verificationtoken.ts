import * as z from "zod"

export const verificationTokenType = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
})

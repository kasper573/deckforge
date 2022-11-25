import * as z from "zod"
import { UserRole } from "@prisma/client"

export const exampleType = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.nativeEnum(UserRole),
})

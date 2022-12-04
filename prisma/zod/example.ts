import { z } from "zod"
import { UserRole } from "./enums"

export const exampleType = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.nativeEnum(UserRole),
})

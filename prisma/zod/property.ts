import * as z from "zod"

export const propertyType = z.object({
  propertyId: z.string(),
  name: z.string(),
  typeName: z.string(),
  entityId: z.string(),
  gameId: z.string(),
})

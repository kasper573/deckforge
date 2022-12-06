import * as z from "zod"
import { CompleteGame, relatedGameType, CompleteCardPropertyDefault, relatedCardPropertyDefaultType } from "./index"

export const propertyType = z.object({
  propertyId: z.string(),
  name: z.string(),
  typeName: z.string(),
  entityId: z.string(),
  gameId: z.string(),
})

export interface CompleteProperty extends z.infer<typeof propertyType> {
  game: CompleteGame
  cardDefaults: CompleteCardPropertyDefault[]
}

/**
 * relatedPropertyType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedPropertyType: z.ZodSchema<CompleteProperty> = z.lazy(() => propertyType.extend({
  game: relatedGameType,
  cardDefaults: relatedCardPropertyDefaultType.array(),
}))

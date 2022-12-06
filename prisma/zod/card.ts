import * as z from "zod"
import { CompleteGame, relatedGameType, CompleteDeck, relatedDeckType, CompleteCardPropertyDefault, relatedCardPropertyDefaultType } from "./index"

export const cardType = z.object({
  cardId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  gameId: z.string(),
  deckId: z.string(),
})

export interface CompleteCard extends z.infer<typeof cardType> {
  game: CompleteGame
  deck: CompleteDeck
  propertyDefaults: CompleteCardPropertyDefault[]
}

/**
 * relatedCardType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedCardType: z.ZodSchema<CompleteCard> = z.lazy(() => cardType.extend({
  game: relatedGameType,
  deck: relatedDeckType,
  propertyDefaults: relatedCardPropertyDefaultType.array(),
}))

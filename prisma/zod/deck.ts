import * as z from "zod"
import { CompleteGame, relatedGameType, CompleteCard, relatedCardType } from "./index"

export const deckType = z.object({
  deckId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  gameId: z.string(),
})

export interface CompleteDeck extends z.infer<typeof deckType> {
  game: CompleteGame
  cards: CompleteCard[]
}

/**
 * relatedDeckType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedDeckType: z.ZodSchema<CompleteDeck> = z.lazy(() => deckType.extend({
  game: relatedGameType,
  cards: relatedCardType.array(),
}))

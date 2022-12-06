import * as z from "zod"
import { CompleteUser, relatedUserType, CompleteDeck, relatedDeckType, CompleteCard, relatedCardType, CompleteProperty, relatedPropertyType } from "./index"

export const gameType = z.object({
  gameId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  ownerId: z.string(),
})

export interface CompleteGame extends z.infer<typeof gameType> {
  owner: CompleteUser
  decks: CompleteDeck[]
  cards: CompleteCard[]
  Property: CompleteProperty[]
}

/**
 * relatedGameType contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const relatedGameType: z.ZodSchema<CompleteGame> = z.lazy(() => gameType.extend({
  owner: relatedUserType,
  decks: relatedDeckType.array(),
  cards: relatedCardType.array(),
  Property: relatedPropertyType.array(),
}))

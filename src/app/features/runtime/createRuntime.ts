import { groupBy } from "lodash";
import type { Card, Game } from "../../../api/services/game/types";
import { createGame } from "../../../lib/deckforge/Game";
import { RuntimeCard, RuntimeDeck } from "../../../lib/deckforge/Entities";

export type Runtime = ReturnType<typeof createRuntime>;

export function createRuntime({ definition: { cards, decks } }: Game) {
  const cardsByDeck = groupBy(cards, "deckId");

  return createGame({
    decks: decks.reduce((map, deck) => {
      const cardIds = cardsByDeck[deck.deckId].map((m) => m.cardId);
      return map.set(deck.deckId, new RuntimeDeck(cardIds));
    }, new Map()),
    players: new Map(),
    battles: new Map(),
    cards: cards.reduce((map, card) => {
      const runtimeCard = createRuntimeCard(card);
      return map.set(runtimeCard.id, runtimeCard);
    }, new Map()),
  });
}

function createRuntimeCard(card: Card): RuntimeCard {
  class Card extends RuntimeCard {
    constructor() {
      super({});
    }
  }

  return new Card();
}

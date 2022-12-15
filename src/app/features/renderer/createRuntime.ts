import { groupBy } from "lodash";
import type { Card, Game } from "../../../api/services/game/types";
import type { GameState } from "../../../lib/deckforge/Game";
import { createGame } from "../../../lib/deckforge/Game";
import { RuntimeCard, RuntimeDeck } from "../../../lib/deckforge/Entities";

export type Runtime = ReturnType<typeof createRuntime>;
export type RuntimeInitialState = Partial<
  Pick<GameState, "players" | "battles">
>;

export function createRuntime(
  { definition: { cards, decks } }: Game,
  { players = new Map(), battles = new Map() }: RuntimeInitialState = {}
) {
  const cardsByDeck = groupBy(cards, "deckId");

  return createGame({
    decks: decks.reduce((map, deck) => {
      const cardIds = cardsByDeck[deck.deckId]?.map((m) => m.cardId) ?? [];
      return map.set(deck.deckId, new RuntimeDeck(cardIds));
    }, new Map()),
    players,
    battles,
    cards: cards.reduce((map, card) => {
      const runtimeCard = createRuntimeCard(card);
      return map.set(runtimeCard.id, runtimeCard);
    }, new Map()),
  });
}

function createRuntimeCard(card: Card): RuntimeCard {
  class CompiledCard extends RuntimeCard {
    constructor() {
      super(card.name, {});
    }
  }

  return new CompiledCard();
}

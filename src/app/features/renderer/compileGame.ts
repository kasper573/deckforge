import { groupBy } from "lodash";
import type { Card, Game } from "../../../api/services/game/types";
import type { GameState } from "../runtime/Runtime";
import { createGameRuntime } from "../runtime/Runtime";
import { RuntimeCard, RuntimeDeck } from "../runtime/Entities";

export type GameCompilerInitialState = Partial<
  Pick<GameState, "players" | "battles">
>;

export function compileGame(
  { definition: { cards, decks } }: Game,
  { players = new Map(), battles = new Map() }: GameCompilerInitialState = {}
) {
  const cardsByDeck = groupBy(cards, "deckId");

  return createGameRuntime({
    decks: decks.reduce((map, deck) => {
      const cardIds = cardsByDeck[deck.deckId]?.map((m) => m.cardId) ?? [];
      return map.set(deck.deckId, new RuntimeDeck(cardIds));
    }, new Map()),
    players,
    battles,
    cards: cards.reduce((map, card) => {
      const runtimeCard = compileCard(card);
      return map.set(runtimeCard.id, runtimeCard);
    }, new Map()),
  });
}

function compileCard(card: Card): RuntimeCard {
  class CompiledCard extends RuntimeCard {
    constructor() {
      super(card.name, {});
    }
  }

  return new CompiledCard();
}

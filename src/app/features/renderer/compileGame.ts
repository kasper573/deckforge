import { groupBy } from "lodash";
import { z } from "zod";
import type { SafeParseReturnType } from "zod/lib/types";
import type { Card, Game } from "../../../api/services/game/types";
import type { GameState } from "../runtime/Runtime";
import { createGameRuntime } from "../runtime/Runtime";
import { RuntimeCard, RuntimeDeck } from "../runtime/Entities";
import { cardType } from "../../../api/services/game/types";

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
      return map.set(
        deck.deckId,
        new RuntimeDeck({ id: deck.deckId, cards: cardIds })
      );
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
      super({
        id: card.cardId,
        name: card.name,
      });
      const result = compileEffectsFactory(card.code);
      if (!result.success) {
        throw result.error;
      }
      this.effects = result.data(card);
    }
  }

  return new CompiledCard();
}

const effectType = z.function().args(z.any()).returns(z.any());
const effectsType = z.record(z.array(effectType));
const effectsFactoryType = z.function().args(cardType).returns(effectsType);
type EffectsFactory = z.infer<typeof effectsFactoryType>;

function compileEffectsFactory(
  code: string
): SafeParseReturnType<string, EffectsFactory> {
  code = code.trim();
  if (!code) {
    return { success: true, data: () => ({}) };
  }
  return effectsFactoryType.safeParse(eval(`(${code})`));
}

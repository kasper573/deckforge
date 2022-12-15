import { groupBy } from "lodash";
import { z } from "zod";
import type { Card, Game } from "../../../api/services/game/types";
import type { GameState } from "../runtime/Runtime";
import { createGameRuntime } from "../runtime/Runtime";
import type { Effects } from "../runtime/Entities";
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
      const result = compileEffects(card.code);
      if (!result.success) {
        throw new Error(result.error);
      }
      this.effects = result.effects;
    }
  }

  return new CompiledCard();
}

const effectType = z.function().args(z.any()).returns(z.any());
const effectsType = z.record(z.array(effectType));

function compileEffects(
  code: string
): { success: true; effects: Effects } | { success: false; error: string } {
  const stringAssumedToContainObject = code.trim() || "{}";
  const evalResult = eval(`(${stringAssumedToContainObject})`);
  const parseResult = effectsType.safeParse(evalResult);
  if (!parseResult.success) {
    return { success: false, error: `${parseResult.error}` };
  }
  const effectsWithThisArg = Object.entries(parseResult.data).reduce(
    (effects, [effectName, effectFns]) => ({
      ...effects,
      [effectName]: effectFns,
    }),
    {} as Effects
  );

  return { success: true, effects: effectsWithThisArg };
}

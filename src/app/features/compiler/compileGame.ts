import { groupBy } from "lodash";
import { z } from "zod";
import type { Game, Card, DeckId } from "../../../api/services/game/types";
import type { Machine } from "../../../lib/machine/Machine";
import { deriveMachine } from "./defineRuntime";
import type {
  RuntimeCard,
  RuntimeEffect,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimeMachineContext,
  RuntimeState,
} from "./types";

export type GameRuntime<G extends RuntimeGenerics> = Machine<
  RuntimeMachineContext<G>
>;

export function compileGame<G extends RuntimeGenerics>(
  gameDefinition: Game["definition"],
  createInitialState: (decks: Map<DeckId, RuntimeCard<G>[]>) => RuntimeState<G>
): { runtime?: GameRuntime<G>; error?: unknown } {
  try {
    const decks = Object.entries(
      groupBy(gameDefinition.cards, "deckId")
    ).reduce((map, [deckId, cardDefinitions]) => {
      return map.set(deckId as DeckId, cardDefinitions.map(compileCard<G>));
    }, new Map<DeckId, RuntimeCard<G>[]>());

    const effects = gameDefinition.events.reduce((effects, { name, code }) => {
      effects[name as keyof typeof effects] = compileEffect(code);
      return effects;
    }, {} as RuntimeEffects<G>);

    return { runtime: deriveMachine<G>(effects, createInitialState(decks)) };
  } catch (error) {
    return { error };
  }
}

export function compileCard<G extends RuntimeGenerics>(card: Card) {
  const createEffects = compileEffectsFactory<G, Card>(card.code);

  const runtimeCard: RuntimeCard<G> = {
    id: card.cardId,
    name: card.name,
    properties: {},
    effects: createEffects(card),
  };

  return runtimeCard;
}

function compileEffectsFactory<G extends RuntimeGenerics, Payload>(
  code: string
) {
  code = code.trim();
  return z.function().parse(eval(`(${code})`)) as (
    payload: Payload
  ) => RuntimeEffects<G>;
}

function compileEffect<G extends RuntimeGenerics, Payload>(code: string) {
  code = code.trim();
  return eval(`(${code})`) as RuntimeEffect<G, Payload>;
}

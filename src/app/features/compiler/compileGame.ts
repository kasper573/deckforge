import { groupBy } from "lodash";
import { z } from "zod";
import type { Game, Card, DeckId } from "../../../api/services/game/types";
import type {
  RuntimeCard,
  RuntimeDefinition,
  MachineContextFor,
} from "../runtime/createRuntimeDefinition";
import { deriveMachine } from "../runtime/createRuntimeDefinition";
import type { Machine } from "../../../lib/machine/Machine";

export type GameRuntime<RD extends RuntimeDefinition = RuntimeDefinition> =
  Machine<MachineContextFor<RD>>;

export function compileGame<RD extends RuntimeDefinition>(
  gameDefinition: Game["definition"],
  createInitialState: (
    decks: Map<DeckId, RuntimeCard[]>
  ) => z.infer<RD["state"]>
): { runtime?: GameRuntime<RD>; error?: unknown } {
  try {
    const decks = Object.entries(
      groupBy(gameDefinition.cards, "deckId")
    ).reduce((map, [deckId, cardDefinitions]) => {
      return map.set(deckId as DeckId, cardDefinitions.map(compileCard));
    }, new Map<DeckId, RuntimeCard[]>());

    const effects = gameDefinition.events.reduce((effects, { name, code }) => {
      effects[name] = compileEffect(code);
      return effects;
    }, {} as AnyEffectRecord);

    return { runtime: deriveMachine<RD>(effects, createInitialState(decks)) };
  } catch (error) {
    return { error };
  }
}

export function compileCard(card: Card) {
  const createEffects = compileEffectsFactory<Card, RuntimeCard["effects"]>(
    card.code
  );

  const runtimeCard: RuntimeCard = {
    id: card.cardId,
    name: card.name,
    properties: {},
    effects: createEffects(card),
  };

  return runtimeCard;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEffect = (state: any, payload: any) => void;
type AnyEffectRecord = Record<string, AnyEffect>;

function compileEffectsFactory<Input, Effects extends AnyEffectRecord>(
  code: string
) {
  code = code.trim();
  return z.function().parse(eval(`(${code})`)) as (input: Input) => Effects;
}

function compileEffect<Effect extends AnyEffect>(code: string) {
  code = code.trim();
  return eval(`(${code})`) as Effect;
}

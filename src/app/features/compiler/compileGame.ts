import { groupBy } from "lodash";
import type { ZodType } from "zod";
import type { Game, Card, DeckId } from "../../../api/services/game/types";
import type { Machine } from "../../../lib/machine/Machine";
import { deriveMachine } from "./defineRuntime";
import type {
  RuntimeCard,
  RuntimeDefinition,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimeMachineContext,
  RuntimeState,
} from "./types";

export type GameRuntime<G extends RuntimeGenerics> = Machine<
  RuntimeMachineContext<G>
>;

export function compileGame<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"],
  createInitialState: (decks: Map<DeckId, RuntimeCard<G>[]>) => RuntimeState<G>
): { runtime?: GameRuntime<G>; error?: unknown } {
  try {
    const decks = Object.entries(
      groupBy(gameDefinition.cards, "deckId")
    ).reduce((map, [deckId, cardDefinitions]) => {
      return map.set(
        deckId as DeckId,
        cardDefinitions.map((card) =>
          compileCard(card, runtimeDefinition.effects)
        )
      );
    }, new Map<DeckId, RuntimeCard<G>[]>());

    const effects = gameDefinition.events.reduce((effects, { name, code }) => {
      effects[name as keyof typeof effects] = compile(
        code,
        runtimeDefinition.effect
      );
      return effects;
    }, {} as RuntimeEffects<G>);

    return { runtime: deriveMachine<G>(effects, createInitialState(decks)) };
  } catch (error) {
    return { error };
  }
}

export function compileCard<G extends RuntimeGenerics>(
  card: Card,
  effectsType: ZodType<RuntimeEffects<G>>
): RuntimeCard<G> {
  return {
    id: card.cardId,
    name: card.name,
    properties: {},
    effects: compile(card.code, effectsType, { card }),
  };
}

function compile<T extends ZodType>(
  code: string,
  definitionType: T,
  globals: Record<string, unknown> = {}
) {
  code = code.trim();
  // eslint-disable-next-line prefer-const
  let definition: unknown = undefined;
  eval(`
    function define(arg) {
      definition = arg;
    }
    ${objectToDeclarationCode(globals)}
    ${code}
  `);
  return definitionType.parse(definition);
}

function objectToDeclarationCode(globals: object) {
  return Object.entries(globals).reduce((code, [name, value]) => {
    return `${code}const ${name} = ${JSON.stringify(value)};`;
  }, "");
}

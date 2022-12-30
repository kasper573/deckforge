import { groupBy } from "lodash";
import type { ZodType } from "zod";
import type { z } from "zod";
import type {
  Game,
  Card,
  DeckId,
  PropertyDefaults,
  Property,
} from "../../../api/services/game/types";
import type { Machine } from "../../../lib/machine/Machine";
import { propertyValue } from "../../../api/services/game/types";
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
    const playerPropertyDefaults = namedPropertyDefaults(
      gameDefinition.properties.filter((p) => p.entityId === "player")
    );
    const cardProperties = gameDefinition.properties.filter(
      (p) => p.entityId === "card"
    );

    const decks = Object.entries(
      groupBy(gameDefinition.cards, "deckId")
    ).reduce((map, [deckId, cardDefinitions]) => {
      return map.set(
        deckId as DeckId,
        cardDefinitions.map((card) =>
          compileCard(
            card,
            runtimeDefinition,
            namedPropertyDefaults(cardProperties, card.propertyDefaults)
          )
        )
      );
    }, new Map<DeckId, RuntimeCard<G>[]>());

    const effects = gameDefinition.events.reduce((effects, { name, code }) => {
      effects[name as keyof typeof effects] = compile(code, {
        type: runtimeDefinition.effects.shape[name],
        initialValue: () => {},
      });
      return effects;
    }, {} as RuntimeEffects<G>);

    const initialState = createInitialState(decks);
    for (const player of initialState.players.values()) {
      player.properties = { ...playerPropertyDefaults, ...player.properties };
    }

    return { runtime: deriveMachine<G>(effects, initialState) };
  } catch (error) {
    return { error };
  }
}

export function compileCard<G extends RuntimeGenerics>(
  card: Card,
  runtimeDefinition: RuntimeDefinition<G>,
  propertyDefaults: RuntimeCard<G>["properties"]
): RuntimeCard<G> {
  return {
    id: card.cardId,
    name: card.name,
    properties: propertyDefaults,
    effects: compile(card.code, {
      type: runtimeDefinition.card.shape.effects,
      globals: { card },
      initialValue: {},
    }),
  };
}

function compile<T extends ZodType>(
  code: string,
  options: {
    type: T;
    globals?: Record<string, unknown>;
    initialValue?: z.infer<T>;
  }
): z.infer<T> {
  code = code.trim();
  // eslint-disable-next-line prefer-const
  let definition: unknown = options.initialValue;
  eval(`
    (() => {
      function define(arg) {
        definition = arg;
      }
      ${objectToDeclarationCode(options.globals)}
      ${code}
    })();
  `);
  const result = options.type.safeParse(definition);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  // Cannot use parsed data because zod injects destructive behavior on parsed functions.
  // There's no need for using the parsed data anyway, since it's already json.
  // We're just using zod for validation here, not for parsing.
  return definition;
}

function objectToDeclarationCode(globals: object = {}) {
  return Object.entries(globals).reduce((code, [name, value]) => {
    return `${code}const ${name} = ${JSON.stringify(value)};`;
  }, "");
}

function namedPropertyDefaults(
  properties: Property[],
  defaultsById: PropertyDefaults = {}
) {
  return properties.reduce((defaults, prop) => {
    defaults[prop.name] =
      defaultsById[prop.propertyId] ?? propertyValue.defaultOf(prop.type);
    return defaults;
  }, {} as Record<string, unknown>);
}

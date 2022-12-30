import { groupBy } from "lodash";
import type { ZodType } from "zod";
import type { z } from "zod";
import type {
  Game,
  DeckId,
  PropertyDefaults,
  Property,
  CardId,
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

    const scriptAPI: ScriptAPI<G> = {
      [scriptAPIProperties.actions]: new Proxy({} as typeof runtime.actions, {
        get: (target, propertyName) =>
          runtime.actions[propertyName as keyof typeof runtime.actions],
      }),
    };

    const decks = Object.entries(
      groupBy(gameDefinition.cards, "deckId")
    ).reduce(
      (map, [deckId, cardDefinitions]) =>
        map.set(
          deckId as DeckId,
          cardDefinitions.map(({ cardId, name, code, propertyDefaults }) => ({
            id: cardId,
            name: name,
            properties: namedPropertyDefaults(cardProperties, propertyDefaults),
            effects: compile(code, {
              type: runtimeDefinition.card.shape.effects,
              scriptAPI: { ...scriptAPI, [scriptAPIProperties.cardId]: cardId },
              initialValue: {},
            }),
          }))
        ),
      new Map<DeckId, RuntimeCard<G>[]>()
    );

    const effects = gameDefinition.events.reduce((effects, { name, code }) => {
      effects[name as keyof typeof effects] = compile(code, {
        type: runtimeDefinition.effects.shape[name],
        scriptAPI,
        initialValue: () => {},
      });
      return effects;
    }, {} as RuntimeEffects<G>);

    const initialState = createInitialState(decks);
    for (const player of initialState.players.values()) {
      player.properties = { ...playerPropertyDefaults, ...player.properties };
    }

    const runtime = deriveMachine<G>(effects, initialState);
    return { runtime };
  } catch (error) {
    return { error };
  }
}

type ScriptAPI<G extends RuntimeGenerics = RuntimeGenerics> = {
  actions: G["actions"];
  thisCardId?: CardId;
};

export const scriptAPIProperties = {
  cardId: "thisCardId",
  actions: "actions",
} as const;

function compile<T extends ZodType>(
  code: string,
  options: {
    type: T;
    scriptAPI: ScriptAPI;
    initialValue?: z.infer<T>;
  }
): z.infer<T> {
  let definition = options.initialValue;

  function define(newDefinition: unknown) {
    const result = options.type.safeParse(newDefinition);
    if (!result.success) {
      throw new Error(result.error.message);
    }
    // Cannot use parsed data because zod injects destructive behavior on parsed functions.
    // There's no need for using the parsed data anyway, since it's already json.
    // We're just using zod for validation here, not for parsing.
    definition = newDefinition;
  }

  function derive(createDefinition: (scriptAPI: ScriptAPI) => unknown) {
    define(createDefinition(options.scriptAPI));
  }

  eval(code.trim()); // Assume code calls define/derive to set definition
  return definition;
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

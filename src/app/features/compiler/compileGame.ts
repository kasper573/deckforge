import type { ZodType } from "zod";
import { z } from "zod";
import { v4 } from "uuid";
import type {
  Game,
  PropertyDefaults,
  Property,
  Card,
} from "../../../api/services/game/types";
import type { Machine } from "../../../lib/machine/Machine";
import { propertyValue } from "../../../api/services/game/types";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";
import { deriveMachine } from "./defineRuntime";
import type {
  RuntimeCard,
  CardInstanceId,
  RuntimeDefinition,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimeMachineContext,
  RuntimeState,
  RuntimePlayer,
  RuntimePlayerId,
  RuntimeDeck,
} from "./types";
import { createPile } from "./apis/Pile";

export type GameRuntime<G extends RuntimeGenerics> = Machine<
  RuntimeMachineContext<G>
>;

export type GameInitialPlayer<G extends RuntimeGenerics> = Omit<
  RuntimePlayer<G>,
  "properties"
> & {
  properties?: Partial<RuntimePlayer<G>["properties"]>;
};

export interface GameInitialState<G extends RuntimeGenerics> {
  players: [GameInitialPlayer<G>, GameInitialPlayer<G>];
}

export function compileGame<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"]
): { runtime?: GameRuntime<G>; error?: unknown } {
  try {
    const cardProperties = gameDefinition.properties.filter(
      (p) => p.entityId === "card"
    );

    const scriptAPI: ScriptAPI<G> = {
      cloneCard,
      actions: new Proxy({} as typeof runtime.actions, {
        get: (target, propertyName) =>
          runtime.actions[propertyName as keyof typeof runtime.actions],
      }),
    };

    const decks = gameDefinition.decks.map(
      (deck): RuntimeDeck<G> => ({
        id: deck.deckId,
        name: deck.name,
        cards: gameDefinition.cards
          .filter((c) => c.deckId === deck.deckId)
          .map((card) =>
            compileCard(card, {
              runtimeDefinition,
              scriptAPI,
              cardProperties,
            })
          ),
      })
    );

    const effects = gameDefinition.events.reduce((effects, { name, code }) => {
      effects[name as keyof typeof effects] = compile(code, {
        type: runtimeDefinition.effects.shape[name],
        scriptAPI,
        initialValue: () => {},
      });
      return effects;
    }, {} as RuntimeEffects<G>);

    function cloneCard(card: RuntimeCard<G>): RuntimeCard<G> {
      const cardDefinition = gameDefinition.cards.find(
        (c) => c.cardId === card.typeId
      );
      if (!cardDefinition) {
        throw new Error(`Card ${card.typeId} not found`);
      }
      return compileCard(cardDefinition, {
        runtimeDefinition,
        scriptAPI,
        cardProperties,
      });
    }

    const compiledMiddlewares = gameDefinition.middlewares.map((middleware) =>
      compile(middleware.code, {
        type: runtimeDefinition.middleware,
        scriptAPI,
        initialValue: () => {},
      })
    );

    const initialState = createDefaultInitialState(
      decks,
      gameDefinition.properties
    );

    let builder = deriveMachine<G>(effects, initialState);
    builder = compiledMiddlewares.reduce(
      (builder, next) => builder.middleware(next),
      builder
    );

    const runtime = builder.build();
    return { runtime };
  } catch (error) {
    return { error };
  }
}

function createDefaultInitialState<G extends RuntimeGenerics>(
  decks: RuntimeDeck<G>[],
  propertyDefinitions: Property[]
): RuntimeState<G> {
  const properties = namedPropertyDefaults(
    propertyDefinitions.filter((p) => p.entityId === "player")
  ) as RuntimePlayer<G>["properties"];

  function createDefaultPlayer(): RuntimePlayer<G> {
    return {
      id: v4() as RuntimePlayerId,
      deckId: decks[0]?.id,
      properties,
      board: {
        draw: createPile(),
        discard: createPile(),
        hand: createPile(),
      },
    };
  }

  const p1 = createDefaultPlayer();
  const p2 = createDefaultPlayer();
  return {
    decks,
    status: { type: "idle" },
    players: [p1, p2],
    currentPlayerId: p1.id,
  };
}

type ScriptAPI<G extends RuntimeGenerics> = {
  actions: G["actions"];
  thisCardId?: CardInstanceId;
  cloneCard: (card: RuntimeCard<G>) => RuntimeCard<G>;
};

export function createScriptApiDefinition<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>
): ZodShapeFor<ScriptAPI<G>> {
  return {
    cloneCard: z
      .function()
      .args(runtimeDefinition.card)
      .returns(runtimeDefinition.card) as any,
    actions: runtimeDefinition.actions,
    thisCardId: runtimeDefinition.card.shape.id,
  };
}

function compileCard<G extends RuntimeGenerics>(
  { cardId, name, code, propertyDefaults }: Card,
  options: {
    runtimeDefinition: RuntimeDefinition<G>;
    scriptAPI: ScriptAPI<G>;
    cardProperties: Property[];
  }
): RuntimeCard<G> {
  const id = v4() as CardInstanceId;
  return {
    id,
    typeId: cardId,
    name: name,
    properties: namedPropertyDefaults(options.cardProperties, propertyDefaults),
    effects: compile(code, {
      type: options.runtimeDefinition.card.shape.effects,
      scriptAPI: { ...options.scriptAPI, thisCardId: id },
      initialValue: {},
    }),
  };
}

function compile<T extends ZodType, G extends RuntimeGenerics>(
  code: string,
  options: {
    type: T;
    scriptAPI: ScriptAPI<G>;
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

  function derive(createDefinition: (scriptAPI: ScriptAPI<G>) => unknown) {
    define(createDefinition(options.scriptAPI));
  }

  eval(code); // Assume code calls define/derive to set definition
  return definition;
}

function namedPropertyDefaults(
  properties: Property[],
  defaultsById: PropertyDefaults = {}
) {
  return properties.reduce((defaults, prop) => {
    defaults[prop.name] =
      defaultsById[prop.propertyId] ??
      prop.defaultValue ??
      propertyValue.defaultOf(prop.type);
    return defaults;
  }, {} as Record<string, unknown>);
}

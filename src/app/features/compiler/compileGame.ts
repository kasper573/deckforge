import type { ZodType } from "zod";
import type { z } from "zod";
import { v4 } from "uuid";
import Rand from "rand-seed";
import type {
  Card,
  Game,
  Property,
  PropertyDefaults,
} from "../../../api/services/game/types";
import { propertyValue } from "../../../api/services/game/types";
import type { Machine } from "../../../lib/machine/Machine";
import { evalWithScope } from "../../../lib/evalWithScope";
import { deriveMachine } from "./defineRuntime";
import type {
  CardInstanceId,
  RuntimeCard,
  RuntimeDeck,
  RuntimeDefinition,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimeMachineContext,
  RuntimePlayer,
  RuntimePlayerId,
  RuntimeScriptAPI,
  RuntimeMiddleware,
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
  gameDefinition: Game["definition"],
  options?: {
    seed?: string;
    middlewares?: (
      compiledMiddlewares: RuntimeMiddleware<G>[]
    ) => RuntimeMiddleware<G>[];
  }
): { runtime?: GameRuntime<G>; errors?: unknown[] } {
  try {
    const cardProperties = gameDefinition.properties.filter(
      (p) => p.entityId === "card"
    );
    const playerProperties = gameDefinition.properties.filter(
      (p) => p.entityId === "player"
    );

    const scriptAPI: RuntimeScriptAPI<G> = {
      random: createRandomFn(options?.seed),
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
      effects[name as keyof typeof effects] = describedCompile(
        "Event",
        name,
        code,
        {
          type: runtimeDefinition.effects.shape[name],
          scriptAPI,
          initialValue: () => {},
        }
      );
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
      describedCompile("Middleware", middleware.name, middleware.code, {
        type: runtimeDefinition.middleware,
        scriptAPI,
        initialValue: () => {},
      })
    );

    function createPlayer(): RuntimePlayer<G> {
      const properties = namedPropertyDefaults(
        playerProperties
      ) as RuntimePlayer<G>["properties"];

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

    const initialState = runtimeDefinition.createInitialState({
      decks,
      createPlayer,
    });

    const allMiddlewares =
      options?.middlewares?.(compiledMiddlewares) ?? compiledMiddlewares;

    let builder = deriveMachine<G>(effects, initialState);
    builder = allMiddlewares.reduce(
      (builder, next) => builder.middleware(next),
      builder
    );

    const runtime = builder.build();
    return { runtime };
  } catch (error) {
    if (Array.isArray(error)) {
      return { errors: error };
    }
    return { errors: [error] };
  }
}

function compileCard<G extends RuntimeGenerics>(
  { cardId, name, code, propertyDefaults }: Card,
  options: {
    runtimeDefinition: RuntimeDefinition<G>;
    scriptAPI: RuntimeScriptAPI<G>;
    cardProperties: Property[];
  }
): RuntimeCard<G> {
  const id = v4() as CardInstanceId;
  return {
    id,
    typeId: cardId,
    name: name,
    properties: namedPropertyDefaults(options.cardProperties, propertyDefaults),
    effects: describedCompile("Card", name, code, {
      type: options.runtimeDefinition.card.shape.effects,
      scriptAPI: { ...options.scriptAPI, thisCardId: id },
      initialValue: {},
    }),
  };
}

type CompileResult<T extends ZodType> =
  | { type: "success"; value: z.infer<T> }
  | { type: "error"; error: unknown };

function describedCompile<T extends ZodType, G extends RuntimeGenerics>(
  kind: string,
  name: string,
  ...args: Parameters<typeof compile<T, G>>
) {
  const result = compile(...args);
  if (result.type === "error") {
    throw [kind, `(${name})`, result.error];
  }
  return result.value;
}

function compile<T extends ZodType, G extends RuntimeGenerics>(
  code: string,
  options: {
    type: T;
    scriptAPI: RuntimeScriptAPI<G>;
    initialValue?: z.infer<T>;
  }
): CompileResult<T> {
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

  function derive(
    createDefinition: (scriptAPI: RuntimeScriptAPI<G>) => unknown
  ) {
    define(createDefinition(options.scriptAPI));
  }

  try {
    evalWithScope(code, { define, derive }); // Assume code calls define/derive to set definition
    return { type: "success", value: definition };
  } catch (error) {
    return { type: "error", error };
  }
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

function createRandomFn(seed?: string) {
  const rng = new Rand(seed);
  return () => rng.next();
}

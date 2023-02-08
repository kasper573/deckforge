import { v4 } from "uuid";
import Rand from "rand-seed";
import produce from "immer";
import type {
  Card,
  CardId,
  Game,
  Property,
  PropertyDefaults,
} from "../../../api/services/game/types";
import { propertyValue } from "../../../api/services/game/types";
import type { Machine } from "../../../lib/machine/Machine";
import { deriveMachine } from "./defineRuntime";
import type {
  CardInstanceId,
  RuntimeCard,
  RuntimeDeck,
  RuntimeDefinition,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimeMachineContext,
  RuntimeMiddleware,
  RuntimePlayer,
  RuntimePlayerId,
  RuntimeScriptAPI,
} from "./types";
import { compileModuleDescribed } from "./compileModule";

export interface CompileGameResult<G extends RuntimeGenerics> {
  runtime?: GameRuntime<G>;
  errors?: unknown[];
}

export type GameRuntime<G extends RuntimeGenerics> = Machine<
  RuntimeMachineContext<G>
>;

export function compileGame<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"],
  options?: {
    seed?: string;
    middlewares?: (
      compiledMiddlewares: RuntimeMiddleware<G>[]
    ) => RuntimeMiddleware<G>[];
  }
): CompileGameResult<G> {
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
    const cardEffects = new Map<CardId, Partial<RuntimeEffects<G>>>();

    const decks = gameDefinition.decks.map(
      (deck): RuntimeDeck<G> => ({
        id: deck.deckId,
        name: deck.name,
        cards: gameDefinition.cards
          .filter((c) => c.deckId === deck.deckId)
          .map((def) => {
            const options = { runtimeDefinition, scriptAPI, cardProperties };
            const card = compileCard(def, options);
            const effects = compileCardEffects({ ...card, ...def }, options);
            cardEffects.set(def.cardId, effects);
            return card;
          }),
      })
    );

    const effects = gameDefinition.events.reduce((effects, { name, code }) => {
      effects[name as keyof typeof effects] = compileModuleDescribed(
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

    const compiledMiddlewares = gameDefinition.middlewares.map((middleware) =>
      compileModuleDescribed("Middleware", middleware.name, middleware.code, {
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
          draw: [],
          discard: [],
          hand: [],
        },
      };
    }

    const initialState = runtimeDefinition.createInitialState({
      decks,
      createPlayer,
    });

    const allMiddlewares =
      options?.middlewares?.(compiledMiddlewares) ?? compiledMiddlewares;

    let builder = deriveMachine<G>(
      effects,
      initialState,
      (id, effectName) => cardEffects.get(id)?.[effectName]
    );

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
  return {
    id: createCardInstanceId(),
    typeId: cardId,
    name: name,
    properties: namedPropertyDefaults(options.cardProperties, propertyDefaults),
  };
}

function cloneCard<G extends RuntimeGenerics>(
  card: RuntimeCard<G>
): RuntimeCard<G> {
  return produce(card, (draft) => {
    draft.id = createCardInstanceId();
  });
}

const createCardInstanceId = v4 as () => CardInstanceId;

function compileCardEffects<G extends RuntimeGenerics>(
  { cardId, name, code }: Card,
  options: {
    runtimeDefinition: RuntimeDefinition<G>;
    scriptAPI: RuntimeScriptAPI<G>;
    cardProperties: Property[];
  }
) {
  return compileModuleDescribed("Card", name, code, {
    type: options.runtimeDefinition.cardEffects,
    scriptAPI: { ...options.scriptAPI, thisCardId: cardId },
    initialValue: {},
  });
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

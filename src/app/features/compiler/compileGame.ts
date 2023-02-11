import { v4 } from "uuid";
import Rand from "rand-seed";
import produce from "immer";
import type {
  Card,
  CardId,
  Game,
  Property,
  PropertyDefaults,
  Event,
} from "../../../api/services/game/types";
import { propertyValue } from "../../../api/services/game/types";
import type { ErrorDecorator } from "../../../lib/wrapWithErrorDecorator";
import { LogSpreadError } from "../editor/components/LogList";
import type { MachineMiddleware } from "../../../lib/machine/MachineAction";
import { deriveMachine } from "./defineRuntime";
import type {
  CardInstanceId,
  GameRuntime,
  RuntimeCard,
  RuntimeDeck,
  RuntimeDefinition,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimeMachineContext,
  RuntimeReducer,
  RuntimeModuleAPI,
  RuntimePlayer,
  RuntimePlayerId,
} from "./types";
import { ModuleCompiler } from "./compileModule";

export interface CompileGameResult<G extends RuntimeGenerics> {
  runtime?: GameRuntime<G>;
  errors?: unknown[];
}

export function compileGame<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"],
  options?: {
    debug?: boolean;
    seed?: string;
    middlewares?: (
      defaultMiddlewares: MachineMiddleware<RuntimeMachineContext<G>>[]
    ) => MachineMiddleware<RuntimeMachineContext<G>>[];
  }
): CompileGameResult<G> {
  const cardProperties = gameDefinition.properties.filter(
    (p) => p.entityId === "card"
  );
  const playerProperties = gameDefinition.properties.filter(
    (p) => p.entityId === "player"
  );

  const moduleCompiler = new ModuleCompiler(decorateModuleError, {
    debug: options?.debug,
  });
  const moduleAPI: RuntimeModuleAPI<G> = {
    random: createRandomFn(options?.seed),
    cloneCard,
    events: moduleCompiler.refs(
      Object.fromEntries(
        gameDefinition.events.map((event) => [
          event.name,
          eventModuleName(event),
        ])
      )
    ) as unknown as RuntimeEffects<G>,
  };
  const cardEffects = new Map<CardId, Partial<RuntimeEffects<G>>>();

  const decks = gameDefinition.decks.map(
    (deck): RuntimeDeck<G> => ({
      id: deck.deckId,
      name: deck.name,
      cards: gameDefinition.cards
        .filter((c) => c.deckId === deck.deckId)
        .map((def) => {
          const card = compileCard<G>(def, cardProperties);
          const effects = moduleCompiler.addModule(`Card_${def.cardId}`, {
            type: runtimeDefinition.cardEffects,
            code: def.code,
            globals: { ...moduleAPI, thisCardId: card.typeId },
          });
          cardEffects.set(def.cardId, effects);
          return card;
        }),
    })
  );

  const effects = gameDefinition.events.reduce((effects, event) => {
    effects[event.name as keyof typeof effects] = moduleCompiler.addModule(
      eventModuleName(event),
      {
        type: runtimeDefinition.effects.shape[event.name],
        code: event.code,
        globals: moduleAPI,
      }
    );
    return effects;
  }, {} as RuntimeEffects<G>);

  const runtimeReducers = gameDefinition.reducers.map(({ reducerId, code }) =>
    moduleCompiler.addModule(`Reducer_${reducerId}`, {
      type: runtimeDefinition.reducer,
      code,
      globals: moduleAPI,
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

  const result = moduleCompiler.compile();
  if (result.isErr()) {
    return { errors: [result.error] };
  }

  const initialState = runtimeDefinition.createInitialState({
    decks,
    createPlayer,
  });

  const defaultMiddlewares = runtimeReducers.length
    ? [createReducerReducer(...runtimeReducers)]
    : [];

  const allMiddlewares =
    options?.middlewares?.(defaultMiddlewares) ?? defaultMiddlewares;

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
}

function compileCard<G extends RuntimeGenerics>(
  { cardId, name, propertyDefaults }: Card,
  cardProperties: Property[]
): RuntimeCard<G> {
  return {
    id: createCardInstanceId(),
    typeId: cardId,
    name: name,
    properties: namedPropertyDefaults(cardProperties, propertyDefaults),
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
const eventModuleName = (event: Event) => `Event_${event.eventId}`;

const decorateModuleError: ErrorDecorator = (error, [moduleName, ...path]) =>
  error instanceof LogSpreadError
    ? error // Keep the innermost error as-is
    : new LogSpreadError(moduleName, "(", name, ")", ...path, error);

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

function createReducerReducer<G extends RuntimeGenerics>(
  ...reducers: RuntimeReducer<G>[]
): MachineMiddleware<RuntimeMachineContext<G>> {
  return (state, action, next) => {
    for (const reduce of reducers) {
      reduce(state, action);
    }
    next();
  };
}

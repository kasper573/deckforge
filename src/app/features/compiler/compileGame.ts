import { v4 } from "uuid";
import Rand from "rand-seed";
import produce from "immer";
import type {
  Card,
  CardId,
  Deck,
  Event,
  Game,
  Property,
  PropertyDefaults,
  Reducer,
} from "../../../api/services/game/types";
import { propertyValue } from "../../../api/services/game/types";
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
  RuntimeModuleAPI,
  RuntimePlayer,
  RuntimePlayerId,
  RuntimeReducer,
} from "./types";
import { JSInterpreterModuleRuntime } from "./moduleRuntimes/JSInterpreter";
import { validIdentifier } from "./moduleRuntimes/JSInterpreter";
import { moduleCompilerOptions } from "./moduleCompilerOptions";
import type { ModuleRuntime } from "./moduleRuntimeTypes";

export interface CompileGameResult<G extends RuntimeGenerics> {
  runtime?: GameRuntime<G>;
  errors?: unknown[];
}

export function compileGame<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"],
  {
    moduleRuntime = new JSInterpreterModuleRuntime({
      compilerOptions: moduleCompilerOptions,
    }),
    seed,
    middlewares,
  }: {
    moduleRuntime?: ModuleRuntime;
    seed?: string;
    middlewares?: (
      defaultMiddlewares: MachineMiddleware<RuntimeMachineContext<G>>[]
    ) => MachineMiddleware<RuntimeMachineContext<G>>[];
  } = {}
): CompileGameResult<G> {
  const cardProperties = gameDefinition.properties.filter(
    (p) => p.entityId === "card"
  );
  const playerProperties = gameDefinition.properties.filter(
    (p) => p.entityId === "player"
  );

  const moduleAPI: RuntimeModuleAPI<G> = {
    random: createRandomFn(seed),
    cloneCard,
    events: moduleRuntime.refs(
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
          const effects = moduleRuntime.addModule(cardModuleName(deck, def), {
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
    effects[event.name as keyof typeof effects] = moduleRuntime.addModule(
      eventModuleName(event),
      {
        type: runtimeDefinition.effects.shape[event.name],
        code: event.code,
        globals: moduleAPI,
      }
    );
    return effects;
  }, {} as RuntimeEffects<G>);

  const runtimeReducers = gameDefinition.reducers.map((reducer) =>
    moduleRuntime.addModule(reducerModuleName(reducer), {
      type: runtimeDefinition.reducer,
      code: reducer.code,
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

  const result = moduleRuntime.compile();
  if (result.isErr()) {
    return { errors: [result.error] };
  }

  const initialState = runtimeDefinition.createInitialState({
    decks,
    createPlayer,
  });

  const defaultMiddlewares = runtimeReducers.length
    ? [createReducerMiddleware(...runtimeReducers)]
    : [];

  const allMiddlewares =
    middlewares?.(defaultMiddlewares) ?? defaultMiddlewares;

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
const eventModuleName = (event: Event) =>
  validIdentifier(`Event_${event.name}`);
const reducerModuleName = (reducer: Reducer) =>
  validIdentifier(`Reducer_${reducer.name}`);
const cardModuleName = (deck: Deck, card: Card) =>
  validIdentifier(`Card_${deck.name}_${card.name}`);

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

function createReducerMiddleware<G extends RuntimeGenerics>(
  ...reducers: RuntimeReducer<G>[]
): MachineMiddleware<RuntimeMachineContext<G>> {
  return (state, action, next) => {
    next();
    for (const reduce of reducers) {
      reduce(state, action);
    }
  };
}

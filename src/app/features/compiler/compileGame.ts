import { v4 } from "uuid";
import Rand from "rand-seed";
import produce from "immer";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { groupBy } from "lodash";
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
import type { ModuleCompiler } from "./moduleRuntimes/types";
import { ModuleReference } from "./moduleRuntimes/types";

export interface CompiledGame<G extends RuntimeGenerics> {
  runtime: GameRuntime<G>;
  dispose: () => void;
}

export type CompileGameResult<G extends RuntimeGenerics> = Result<
  CompiledGame<G>,
  unknown[]
>;

export interface CompileGameOptions<
  G extends RuntimeGenerics = RuntimeGenerics
> {
  seed?: string;
  log?: (...args: unknown[]) => void;
  moduleCompiler: ModuleCompiler;
  middlewares?: (
    defaultMiddlewares: MachineMiddleware<RuntimeMachineContext<G>>[]
  ) => MachineMiddleware<RuntimeMachineContext<G>>[];
}

export function compileGame<G extends RuntimeGenerics>(
  runtimeDefinition: RuntimeDefinition<G>,
  gameDefinition: Game["definition"],
  { moduleCompiler, seed, middlewares, log = () => {} }: CompileGameOptions<G>
): CompileGameResult<G> {
  const cardProperties = gameDefinition.properties.filter(
    (p) => p.entityId === "card"
  );
  const playerProperties = gameDefinition.properties.filter(
    (p) => p.entityId === "player"
  );

  const deferredEvents = Object.fromEntries(
    gameDefinition.events.map((event) => [
      event.name,
      new ModuleReference(eventModuleName(event), getEventType(event)),
    ])
  ) as unknown as RuntimeEffects<G>;

  const moduleAPI: RuntimeModuleAPI<G> = {
    log,
    cloneCard,
    events: deferredEvents,
  };

  const overrides: BuiltinOverrides = {
    Math: {
      random: createRandomFn(seed),
    },
  };

  const globals = {
    ...moduleAPI,
    ...overrides,
  };

  const cardLookup = groupBy(gameDefinition.cards, (c) => c.deckId);
  const cardModules = {} as Record<CardId, Partial<RuntimeEffects<G>>>;
  const decks: RuntimeDeck<G>[] = [];
  for (const deck of gameDefinition.decks) {
    const cards: RuntimeCard<G>[] = [];
    for (const def of cardLookup[deck.deckId] ?? []) {
      const cardGlobals: RuntimeModuleAPI<G> = {
        ...globals,
        thisCardId: def.cardId,
      };
      cards.push(compileCard<G>(def, cardProperties));
      cardModules[def.cardId] = moduleCompiler.addModule({
        name: cardModuleName(deck, def),
        type: runtimeDefinition.cardEffects,
        code: def.code,
        globals: cardGlobals,
      });
    }
    decks.push({ id: deck.deckId, name: deck.name, cards });
  }

  const eventModules = gameDefinition.events.reduce((modules, event) => {
    modules[event.name as keyof typeof modules] = moduleCompiler.addModule({
      name: eventModuleName(event),
      type: getEventType(event),
      code: event.code,
      globals,
    });
    return modules;
  }, {} as RuntimeEffects<G>);

  const reducerModules = gameDefinition.reducers.map((reducer) =>
    moduleCompiler.addModule({
      name: reducerModuleName(reducer),
      type: runtimeDefinition.reducer,
      code: reducer.code,
      globals,
    })
  );

  function getEventType(event: Event) {
    return (
      runtimeDefinition.effects.shape[event.name] ??
      runtimeDefinition.emptyEffect
    );
  }

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

  function dispose() {
    moduleCompiler.dispose();
  }

  const moduleCompileResult = moduleCompiler.compile();
  if (moduleCompileResult.isErr()) {
    return err(Object.entries(moduleCompileResult.error).map(([, e]) => e));
  }

  const initialState = runtimeDefinition.createInitialState({
    decks,
    createPlayer,
  });

  const defaultMiddlewares = reducerModules.length
    ? [createReducerMiddleware(...reducerModules)]
    : [];

  const allMiddlewares =
    middlewares?.(defaultMiddlewares) ?? defaultMiddlewares;

  let builder = deriveMachine<G>(
    eventModules,
    initialState,
    (id, effectName) => cardModules[id][effectName]
  );

  builder = allMiddlewares.reduce(
    (builder, next) => builder.middleware(next),
    builder
  );

  const runtime = builder.build();

  return ok({ runtime, dispose });
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
const moduleName = (str: string) => str.replace(/[^a-zA-Z0-9_]/g, "_");
const eventModuleName = (event: Event) => moduleName(`Event_${event.name}`);
const reducerModuleName = (reducer: Reducer) =>
  moduleName(`Reducer_${reducer.name}`);
const cardModuleName = (deck: Deck, card: Card) =>
  moduleName(`Card_${deck.name}_${card.name}`);

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

type BuiltinOverrides<T = typeof window> = {
  [K in keyof T]?: Partial<T[K]>;
};

import type { ZodRawShape, ZodType } from "zod";
import { z } from "zod";
import type { ZodTypeAny } from "zod/lib/types";
import { uniqBy } from "lodash";
import type {
  CardId,
  DeckId,
  Event,
  Game,
  Property,
} from "../../../api/services/game/types";
import {
  cardType as cardDefinitionType,
  propertyValue,
} from "../../../api/services/game/types";
import { zodRuntimeBranded } from "../../../lib/zod-extensions/zodRuntimeBranded";
import { createMachine } from "../../../lib/machine/Machine";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";
import { zodSpreadArgs } from "../../../lib/zod-extensions/zodToTS";
import type {
  PropRecord,
  RuntimeDefinition,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimePlayerId,
  RuntimeState,
  RuntimeModuleAPI,
  RuntimeStateFactory,
} from "./types";
import type { RuntimeEffect } from "./types";
import { cardInstanceIdType } from "./types";
import { symbols } from "./moduleRuntimes/symbols";

export function defineRuntime<
  GlobalPropTypeDefs extends ZodRawShape,
  PlayerProps extends PropRecord,
  CardProps extends PropRecord,
  ActionTypeDefs extends ZodRawShape
>({
  globalProperties: createGlobalProperties,
  playerProperties,
  cardProperties,
  actions: createActionsShape,
  initialState: createInitialState,
}: {
  globalProperties: (types: {
    playerId: ZodType<RuntimePlayerId>;
    deckId: ZodType<DeckId>;
  }) => GlobalPropTypeDefs;
  playerProperties: ZodShapeFor<PlayerProps>;
  cardProperties: ZodShapeFor<CardProps>;
  actions: (types: {
    playerId: ZodType<RuntimePlayerId>;
    deckId: ZodType<DeckId>;
  }) => ActionTypeDefs;
  initialState: RuntimeStateFactory<
    RuntimeGenerics<
      PlayerProps,
      CardProps,
      z.objectInputType<ActionTypeDefs, ZodTypeAny>,
      z.objectInputType<GlobalPropTypeDefs, ZodTypeAny>
    >
  >;
}) {
  type Actions = z.objectInputType<ActionTypeDefs, ZodTypeAny>;
  type GlobalProps = z.objectInputType<GlobalPropTypeDefs, ZodTypeAny>;
  type G = RuntimeGenerics<PlayerProps, CardProps, Actions, GlobalProps>;

  const playerId = zodRuntimeBranded("RuntimePlayerId");
  const deckId = cardDefinitionType.shape.deckId;

  const lazyState = z.lazy(() => state);
  const actionsShape = createActionsShape({ playerId, deckId });

  const actions = z.object(
    actionsShape
  ) as unknown as RuntimeDefinition<G>["actions"];

  const effects = deriveEffectsType(
    actionsShape,
    lazyState
  ) as unknown as RuntimeDefinition<G>["effects"];

  const card = z.object({
    id: cardInstanceIdType,
    typeId: cardDefinitionType.shape.cardId,
    name: cardDefinitionType.shape.name,
    properties: z.object(cardProperties),
  }) as unknown as RuntimeDefinition<G>["card"];

  const cardEffects =
    effects.partial() as unknown as RuntimeDefinition<G>["cardEffects"];

  const deck = z.object({
    id: deckId,
    name: cardDefinitionType.shape.name,
    cards: z.array(card),
  }) as unknown as RuntimeDefinition<G>["deck"];

  const player = z.object({
    id: playerId,
    deckId,
    properties: z.object(playerProperties),
    board: z.object({
      draw: z.array(card),
      hand: z.array(card),
      discard: z.array(card),
    }),
  }) as unknown as RuntimeDefinition<G>["player"];

  const globals = z.object(
    createGlobalProperties({ playerId, deckId })
  ) as unknown as RuntimeDefinition<G>["globals"];

  const state = z.object({
    decks: z.array(deck),
    players: z.tuple([player, player]),
    properties: globals,
  }) as unknown as RuntimeDefinition<G>["state"];

  const actionUnion = z.unknown();

  const reducer = z
    .function()
    .args(state, actionUnion)
    .returns(z.void()) as RuntimeDefinition<G>["reducer"];

  const definition: RuntimeDefinition<G> = {
    globals,
    deck,
    card,
    cardEffects,
    player,
    state,
    effects,
    actions,
    reducer,
    createInitialState,
  };

  return definition;
}

export function deriveRuntimeDefinitionParts({
  properties,
  events,
}: Game["definition"]) {
  const playerPropertyList = properties.filter((p) => p.entityId === "player");
  const cardPropertyList = properties.filter((p) => p.entityId === "card");
  return {
    playerProperties: propertiesToZodShape(playerPropertyList),
    cardProperties: propertiesToZodShape(cardPropertyList),
    actions: () => eventsToZodShape(events),
  };
}

export function deriveRuntimeDefinition<Base extends RuntimeDefinition>(
  gameDefinition: Game["definition"],
  baseDefinition?: Base
) {
  const commonProps = deriveRuntimeDefinitionParts(gameDefinition);

  if (baseDefinition) {
    const mergedActions = {
      ...commonProps.actions(),
      ...baseDefinition.actions.shape,
    };
    return defineRuntime({
      ...commonProps,
      actions: () => mergedActions,
      globalProperties: () => baseDefinition.globals.shape,
      initialState: baseDefinition?.createInitialState,
    });
  }

  return defineRuntime({
    ...commonProps,
    globalProperties: () => ({}),
    initialState: () => ({
      players: [],
      decks: [],
      properties: {},
    }),
  });
}

const propertiesToZodShape = (propertyList: Property[]) =>
  propertyList.reduce(
    (shape, property) => ({
      ...shape,
      [property.name]: propertyValue.valueTypeOf(property.type),
    }),
    {} as ZodRawShape
  );

const eventsToZodShape = <G extends RuntimeGenerics>(eventList: Event[]) =>
  eventList.reduce(
    (shape, event) => ({
      ...shape,
      [event.name]: z
        .function()
        .args(propertyValue.valueTypeOf(event.inputType))
        .returns(z.void()),
    }),
    {} as ZodShapeFor<G["actions"]>
  );

function deriveEffectsType<G extends RuntimeGenerics>(
  actionTypes: ZodShapeFor<G["actions"]>,
  stateType: ZodType<RuntimeState<G>>
) {
  const shape = Object.entries(actionTypes).reduce(
    (shape, [actionName, actionType]) => {
      const args = actionType._def.args._def.items;
      const effectType = z.function(z.tuple([stateType, ...args]), z.void());
      return { ...shape, [actionName]: effectType };
    },
    {} as ZodShapeFor<RuntimeEffects<G>>
  );
  return z.object(shape);
}

export function deriveMachine<G extends RuntimeGenerics>(
  effects: RuntimeEffects<G>,
  initialState: RuntimeState<G>,
  getEffectsForCard: <EffectName extends keyof G["actions"]>(
    id: CardId,
    action: EffectName
  ) => RuntimeEffect<G, EffectName> | undefined
) {
  return createMachine(initialState)
    .effects(effects)
    .reactions(function* (state, effectName) {
      const cardsInDecks = state.decks.map((deck) => deck.cards).flat();
      const cardOnBoards = state.players.flatMap((p) =>
        Object.values(p.board)
          .map((pile) => Array.from(pile))
          .flat()
      );

      const typeUniqueCards = uniqBy(
        [...cardsInDecks, ...cardOnBoards],
        (card) => card.typeId
      );

      for (const card of typeUniqueCards) {
        const effect = getEffectsForCard(card.typeId, effectName);
        if (effect !== undefined) {
          yield effect;
        }
      }
    });
}

export function runtimeEvent<Args extends [] | [ZodTypeAny]>(...args: Args) {
  return z.function(z.tuple(args), z.void());
}

export function createModuleApiDefinition<G extends RuntimeGenerics>(
  { card, effects }: Pick<RuntimeDefinition<G>, "card" | "effects">,
  outputType: ZodType
) {
  const events = effects as unknown as ZodType<RuntimeModuleAPI<G>["events"]>;
  const cloneCard = z.function().args(card).returns(card) as unknown as ZodType<
    RuntimeModuleAPI<G>["cloneCard"]
  >;
  const apiTypes: ZodShapeFor<RuntimeModuleAPI<G>> = {
    cloneCard,
    events,
    thisCardId: card.shape.typeId,
    log: zodSpreadArgs(z.function().args(z.unknown()).returns(z.void())),
  };

  return {
    ...apiTypes,
    [symbols.define]: z.function().args(outputType).returns(z.void()),
  };
}

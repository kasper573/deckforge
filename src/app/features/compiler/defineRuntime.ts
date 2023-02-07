import type { ZodRawShape, ZodType } from "zod";
import { z } from "zod";
import type { ZodTypeAny } from "zod/lib/types";
import { uniq } from "lodash";
import type {
  DeckId,
  Event,
  Game,
  Property,
} from "../../../api/services/game/types";
import {
  cardType as cardDefinitionType,
  propertyValue,
} from "../../../api/services/game/types";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import { createMachine } from "../../../lib/machine/Machine";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";
import type {
  PropRecord,
  RuntimeDefinition,
  RuntimeEffects,
  RuntimeGenerics,
  RuntimePlayerId,
  RuntimeState,
  RuntimeScriptAPI,
  RuntimeStateFactory,
} from "./types";
import { zodPile } from "./apis/Pile";
import type { CardInstanceId } from "./types";
import type { RuntimeEffect } from "./types";

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

  const playerId = zodNominalString<RuntimePlayerId>();
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
    id: cardDefinitionType.shape.cardId,
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

  const cardPile = zodPile(card) as unknown as RuntimeDefinition<G>["cardPile"];

  const player = z.object({
    id: playerId,
    deckId,
    properties: z.object(playerProperties),
    board: z.object({
      draw: cardPile,
      hand: cardPile,
      discard: cardPile,
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
  const middlewareNext = z.function().args().returns(z.void());

  const middleware = z
    .function()
    .args(state, actionUnion, middlewareNext)
    .returns(z.void()) as RuntimeDefinition<G>["middleware"];

  const definition: RuntimeDefinition<G> = {
    globals,
    deck,
    card,
    cardEffects,
    cardPile,
    player,
    state,
    effects,
    actions,
    middleware,
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
    return defineRuntime({
      ...commonProps,
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
    id: CardInstanceId,
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

      const cards = uniq([...cardsInDecks, ...cardOnBoards]);

      for (const card of cards) {
        const effect = getEffectsForCard(card.id, effectName);
        if (effect !== undefined) {
          yield effect;
        }
      }
    });
}

export function runtimeEvent<Args extends [] | [ZodTypeAny]>(...args: Args) {
  return z.function(z.tuple(args), z.void());
}

export function createScriptApiDefinition<G extends RuntimeGenerics>({
  card,
  actions,
}: Pick<RuntimeDefinition<G>, "card" | "actions">): ZodShapeFor<
  RuntimeScriptAPI<G>
> {
  const cloneCard = z.function().args(card).returns(card) as unknown as ZodType<
    RuntimeScriptAPI<G>["cloneCard"]
  >;
  return {
    cloneCard,
    actions,
    thisCardId: card.shape.id,
    random: z.function().args(z.void()).returns(z.number()),
  };
}

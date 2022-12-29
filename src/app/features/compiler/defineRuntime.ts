import type { ZodRawShape, ZodType, ZodLazy } from "zod";
import { z } from "zod";
import type { ZodTypeAny } from "zod/lib/types";
import type {
  Game,
  Event,
  Property,
  CardId,
} from "../../../api/services/game/types";
import {
  cardType as cardDefinitionType,
  propertyValue,
} from "../../../api/services/game/types";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import type { NominalString } from "../../../lib/ts-extensions/NominalString";
import type {
  MachineAction,
  MachineReaction,
} from "../../../lib/machine/MachineAction";
import { createMachine } from "../../../lib/machine/Machine";
import type { MachineContext } from "../../../lib/machine/MachineContext";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";

export interface RuntimeCard<G extends RuntimeGenerics> {
  id: CardId;
  name: string;
  properties: G["cardProps"];
  effects: Partial<RuntimeEffects<G>>;
}

export type RuntimePlayerId = NominalString<"PlayerId">;
export interface RuntimePlayer<G extends RuntimeGenerics> {
  id: RuntimePlayerId;
  properties: G["playerProps"];
  cards: {
    draw: RuntimeCard<G>[];
    hand: RuntimeCard<G>[];
    discard: RuntimeCard<G>[];
    deck: RuntimeCard<G>[];
  };
}

export interface RuntimeGenerics<
  PlayerProps extends PropRecord = any,
  CardProps extends PropRecord = any,
  Actions extends ActionRecord = any
> {
  playerProps: PlayerProps;
  cardProps: CardProps;
  actions: Actions;
}

export interface RuntimeState<G extends RuntimeGenerics> {
  players: [RuntimePlayer<G>, RuntimePlayer<G>];
  winner?: RuntimePlayerId;
}

export type RuntimeEffect<
  G extends RuntimeGenerics,
  Args extends ActionArgs
> = (state: RuntimeState<G>, ...args: Args) => void;

export type RuntimeEffects<G extends RuntimeGenerics> = {
  [K in keyof G["actions"]]: RuntimeEffect<G, Parameters<G["actions"][K]>>;
};

export interface RuntimeDefinition<
  G extends RuntimeGenerics = RuntimeGenerics
> {
  state: ZodType<RuntimeState<G>>;
  card: ZodType<RuntimeCard<G>>;
  player: ZodType<RuntimePlayer<G>>;
  effects: ZodType<RuntimeEffects<G>>;
  actions: ZodType<G["actions"]>;
  lazyState: ZodLazy<ZodType<RuntimeState<G>>>;
}

type PropRecord = Record<string, any>;
type ActionRecord = Record<string, ActionFn>;
type ActionArgs = any[];
type ActionFn<Args extends ActionArgs = any> = (...args: Args) => void;

export type RuntimeGenericsFor<T extends RuntimeDefinition> =
  T extends RuntimeDefinition<infer G> ? G : never;

export type RuntimeMachineContext<G extends RuntimeGenerics> = MachineContext<
  RuntimeState<G>,
  RuntimeEffects<G>
>;

export function defineRuntime<
  PlayerProps extends PropRecord,
  CardProps extends PropRecord,
  ActionTypeDefs extends ZodRawShape
>({
  playerProperties,
  cardProperties,
  actions: createActionsShape,
}: {
  playerProperties: ZodShapeFor<PlayerProps>;
  cardProperties: ZodShapeFor<CardProps>;
  actions: (types: { playerId: ZodType<RuntimePlayerId> }) => ActionTypeDefs;
}) {
  type Actions = z.objectInputType<ActionTypeDefs, ZodTypeAny>;
  type G = RuntimeGenerics<PlayerProps, CardProps, Actions>;

  const playerId = zodNominalString<RuntimePlayerId>();
  const actionsShape = createActionsShape({ playerId });
  const actions = z.object(actionsShape);
  const lazyState = z.lazy(() => state);
  const effects = deriveEffectsType(actionsShape, lazyState);

  const card = z.object({
    id: cardDefinitionType.shape.cardId,
    name: cardDefinitionType.shape.name,
    properties: z.object(cardProperties),
    effects: effects.partial(),
  }) as unknown as ZodType<RuntimeCard<G>>;

  const cardPile = z.array(card);

  const player = z.object({
    id: playerId,
    properties: z.object(playerProperties),
    cards: z.object({
      deck: cardPile,
      draw: cardPile,
      hand: cardPile,
      discard: cardPile,
    }),
  }) as unknown as ZodType<RuntimePlayer<G>>;

  const state = z.object({
    players: z.tuple([player, player]),
    winner: playerId.optional(),
  }) as unknown as ZodType<RuntimeState<G>>;

  const def: RuntimeDefinition<G> = {
    card,
    player,
    state,
    effects: effects as unknown as ZodType<RuntimeEffects<G>>,
    actions: actions as unknown as ZodType<G["actions"]>,
    lazyState,
  };

  return def;
}

export function deriveRuntimeDefinition({
  properties,
  events,
}: Game["definition"]) {
  const playerPropertyList = properties.filter((p) => p.entityId === "player");
  const cardPropertyList = properties.filter((p) => p.entityId === "card");
  return defineRuntime({
    playerProperties: propertiesToZodShape(playerPropertyList),
    cardProperties: propertiesToZodShape(cardPropertyList),
    actions: () => eventsToZodShape(events),
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

function effectToReaction<State, Payload>(
  effect: (state: State, payload: Payload) => void
): MachineReaction<MachineAction<State, Payload, void>> {
  return (state, { input }) => {
    effect(state, input);
  };
}

function deriveEffectsType<G extends RuntimeGenerics>(
  actionTypes: ZodShapeFor<G["actions"]>,
  stateType: ZodType<RuntimeState<G>>
) {
  const shape = Object.entries(actionTypes).reduce(
    (shape, [eventName, eventType]) => {
      const args = eventType._def.args._def.items;
      const effectType = z.function(z.tuple([stateType, ...args]), z.void());
      return { ...shape, [eventName]: effectType };
    },
    {} as ZodShapeFor<RuntimeEffects<G>>
  );
  return z.object(shape);
}

export function deriveMachine<G extends RuntimeGenerics>(
  eventHandlers: RuntimeEffects<G>,
  initialState: RuntimeState<G>
) {
  return createMachine(initialState)
    .actions(eventHandlers)
    .reactions(function* (state, eventName) {
      for (const player of state.players) {
        const cards = Object.values(player.cards).flat();
        for (const card of cards) {
          const effect = card.effects[eventName as keyof typeof card.effects];
          if (effect) {
            yield effectToReaction(effect);
          }
        }
      }
    })
    .build();
}

export function runtimeEvent<Args extends [] | [ZodTypeAny]>(...args: Args) {
  return z.function(z.tuple(args), z.void());
}

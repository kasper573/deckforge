import type {
  ZodRawShape,
  ZodFunction,
  ZodVoid,
  ZodType,
  ZodObject,
} from "zod";
import { z } from "zod";
import type { ZodTuple } from "zod/lib/types";
import type { ZodTypeAny } from "zod/lib/types";
import type { Game, Event, Property } from "../../../api/services/game/types";
import {
  cardType as cardDefinitionType,
  propertyValue,
} from "../../../api/services/game/types";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import type { NominalString } from "../../../lib/NominalString";
import type {
  MachineAction,
  MachineReaction,
} from "../../../lib/machine/MachineAction";
import { createMachine } from "../../../lib/machine/Machine";

export type RuntimeCard = z.infer<RuntimeDefinition["card"]>;

export type RuntimeDefinition<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PlayerProperties extends ZodRawShape = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardProperties extends ZodRawShape = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Events extends RuntimeEventShape = any
> = ReturnType<
  typeof createRuntimeDefinition<PlayerProperties, CardProperties, Events>
>;

export function createRuntimeDefinition<
  PlayerProperties extends ZodRawShape,
  CardProperties extends ZodRawShape,
  Events extends RuntimeEventShape
>({
  playerProperties,
  cardProperties,
  events: defineEvents,
}: {
  playerProperties: PlayerProperties;
  cardProperties: CardProperties;
  events: (types: { playerId: ZodType<RuntimePlayerId> }) => Events;
}) {
  type State = {
    players: [Player, Player];
    winner?: RuntimePlayerId;
  };
  type Player = z.infer<typeof player>;
  type EffectsType = ZodObject<EffectTypeShape<Events, ZodType<State>>>;
  type Effects = z.infer<EffectsType>;
  type Card = z.infer<typeof cardWithoutEffects> & {
    effects: Partial<Effects>;
  };

  const playerId = zodNominalString<RuntimePlayerId>();
  const eventShape = defineEvents({ playerId });
  const events = z.object(eventShape);
  const lazyState = z.lazy(() => state);
  const effects = deriveEffectsType(eventShape, lazyState);

  const cardWithoutEffects = z.object({
    id: cardDefinitionType.shape.cardId,
    name: cardDefinitionType.shape.name,
    properties: z.object(cardProperties),
  });

  const card = z.object({
    ...cardWithoutEffects.shape,
    effects: effects,
  }) as unknown as ZodType<Card>;

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
  });

  const state = z.object({
    players: z.tuple([player, player]),
    winner: playerId.optional(),
  });

  return {
    card,
    cardPile,
    player,
    playerId,
    state,
    effects,
    events,
    lazy: {
      state: lazyState,
    },
  };
}

export function deriveRuntimeDefinition({
  definition: { properties, events },
}: Game) {
  const playerPropertyList = properties.filter((p) => p.entityId === "player");
  const cardPropertyList = properties.filter((p) => p.entityId === "card");
  return createRuntimeDefinition({
    playerProperties: propertiesToZodShape(playerPropertyList),
    cardProperties: propertiesToZodShape(cardPropertyList),
    events: () => eventsToZodShape(events),
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

const eventsToZodShape = (eventList: Event[]): RuntimeEventShape =>
  eventList.reduce(
    (shape, event) => ({
      ...shape,
      [event.name]: z
        .function()
        .args(propertyValue.valueTypeOf(event.inputType))
        .returns(z.void()),
    }),
    {}
  );

export function effectToReaction<State, Payload>(
  effect: (state: State, payload: Payload) => void
): MachineReaction<MachineAction<State, Payload, void>> {
  return (state, { input }) => {
    effect(state, input);
  };
}

function deriveEffectsType<
  Events extends RuntimeEventShape,
  State extends ZodType
>(eventTypes: Events, stateType: State) {
  const shape = Object.entries(eventTypes).reduce(
    (shape, [eventName, eventType]) => {
      return { ...shape, [eventName]: deriveEffectType(eventType, stateType) };
    },
    {} as EffectTypeShape<Events, State>
  );
  return z.object(shape).partial();
}

function deriveEffectType<Event extends RuntimeEvent, State extends ZodType>(
  eventType: Event,
  stateType: State
) {
  const args = eventType._def.args._def.items;
  const effectType = z.function(z.tuple([stateType, ...args]), z.void());
  return effectType as EffectType<Event, State>;
}

export function deriveMachine<Definition extends RuntimeDefinition>(
  eventHandlers: z.infer<Definition["events"]>,
  initialState: z.infer<Definition["state"]>
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

export type RuntimeEventArgs = [] | [ZodTypeAny];
export type RuntimeEventShape = Record<string, RuntimeEvent>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RuntimeEvent<Args extends RuntimeEventArgs = any> = ZodFunction<
  ZodTuple<Args>,
  ZodVoid
>;

export type EffectType<
  Event extends RuntimeEvent,
  State extends ZodType
> = Event extends RuntimeEvent<infer Args>
  ? ZodFunction<ZodTuple<[State, ...Args]>, ZodVoid>
  : never;

export type EffectTypeShape<
  Events extends RuntimeEventShape,
  State extends ZodType
> = {
  [K in keyof Events]: EffectType<Events[K], State>;
};

export function runtimeEvent<Args extends RuntimeEventArgs>(
  ...args: Args
): RuntimeEvent<Args> {
  return z.function(z.tuple(args), z.void());
}

type RuntimePlayerId = NominalString<"PlayerId">;

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
import { cardType as cardDefinitionType } from "../../../api/services/game/types";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import type { NominalString } from "../../../lib/NominalString";
import type {
  MachineAction,
  MachineReaction,
} from "../../../lib/machine/MachineAction";

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
  const effects = deriveEffectsType(
    eventShape,
    z.lazy(() => state)
  );

  const cardWithoutEffects = z.object({
    id: cardDefinitionType.shape.cardId,
    name: cardDefinitionType.shape.name,
    properties: z.object(cardProperties),
  });

  const card = z.object({
    ...cardWithoutEffects.shape,
    effects: effects.partial(),
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

  function* selectReactions(state: State, eventName: keyof Events) {
    for (const player of state.players) {
      const cards = Object.values(player.cards).flat();
      for (const card of cards) {
        const effect = card.effects[eventName as keyof Effects];
        if (effect) {
          yield effectToReaction(effect);
        }
      }
    }
  }

  return {
    selectReactions,
    typeDefs: {
      card,
      cardPile,
      player,
      playerId,
      state,
      effects,
      events,
    },
  };
}

function effectToReaction<State, Payload>(
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
  return z.object(shape);
}

function deriveEffectType<Event extends RuntimeEvent, State extends ZodType>(
  eventType: Event,
  stateType: State
) {
  const args = eventType._def.args._def.items;
  const effectType = z.function(z.tuple([stateType, ...args]), z.void());
  return effectType as EffectType<Event, State>;
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

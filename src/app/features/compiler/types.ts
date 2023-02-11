import type { z, ZodObject, ZodType } from "zod";
import type {
  MachineActions,
  MachineEffects,
} from "../../../lib/machine/MachineAction";
import type { MachineContext } from "../../../lib/machine/MachineContext";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";
import { zodRuntimeBranded } from "../../../lib/zod-extensions/zodRuntimeBranded";
import type { CardId, DeckId } from "../../../api/services/game/types";
import type { Machine } from "../../../lib/machine/Machine";
import type { MachineActionObject } from "../../../lib/machine/MachineAction";

export type CardInstanceId = z.infer<typeof cardInstanceIdType>;
export const cardInstanceIdType = zodRuntimeBranded("CardInstanceId");

export interface RuntimeCard<G extends RuntimeGenerics> {
  id: CardInstanceId;
  typeId: CardId;
  name: string;
  properties: G["cardProps"];
}

export interface RuntimeDeck<G extends RuntimeGenerics> {
  id: DeckId;
  name: string;
  cards: ReadonlyArray<RuntimeCard<G>>;
}

export const runtimePlayerIdType = zodRuntimeBranded("RuntimePlayerId");
export type RuntimePlayerId = z.infer<typeof runtimePlayerIdType>;

export interface RuntimePlayer<G extends RuntimeGenerics> {
  id: RuntimePlayerId;
  properties: G["playerProps"];
  deckId?: DeckId;
  board: {
    draw: RuntimeCard<G>[];
    hand: RuntimeCard<G>[];
    discard: RuntimeCard<G>[];
  };
}

export interface RuntimeGenerics<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PlayerProps extends PropRecord = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardProps extends PropRecord = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Actions extends MachineActions = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  GlobalProps extends PropRecord = any
> {
  globalProps: GlobalProps;
  playerProps: PlayerProps;
  cardProps: CardProps;
  actions: Actions;
}

export type RuntimeState<G extends RuntimeGenerics> = {
  decks: RuntimeDeck<G>[];
  players: RuntimePlayer<G>[];
  properties: G["globalProps"];
};

export type RuntimeEffects<G extends RuntimeGenerics> = MachineEffects<
  RuntimeMachineContext<G>
>;

export type RuntimeEffect<
  G extends RuntimeGenerics,
  EffectName extends keyof G["actions"]
> = RuntimeEffects<G>[EffectName];

export interface RuntimeDefinition<
  G extends RuntimeGenerics = RuntimeGenerics
> {
  globals: ZodObject<ZodShapeFor<G["globalProps"]>>;
  state: ZodType<RuntimeState<G>>;
  deck: ZodObject<ZodShapeFor<RuntimeDeck<G>>>;
  card: ZodObject<ZodShapeFor<RuntimeCard<G>>>;
  cardEffects: ZodType<Partial<RuntimeEffects<G>>>;
  cardPile: ZodType<RuntimeCard<G>[]>;
  player: ZodObject<ZodShapeFor<RuntimePlayer<G>>>;
  effects: ZodObject<ZodShapeFor<RuntimeEffects<G>>>;
  actions: ZodObject<ZodShapeFor<G["actions"]>>;
  reducer: ZodType<RuntimeReducer<G>>;
  createInitialState: RuntimeStateFactory<G>;
}

export type RuntimeStateFactory<G extends RuntimeGenerics> = (options: {
  decks: RuntimeDeck<G>[];
  createPlayer: () => RuntimePlayer<G>;
}) => RuntimeState<G>;

export type PropRecord = Record<string, unknown>;

export type RuntimeGenericsFor<T extends RuntimeDefinition> =
  T extends RuntimeDefinition<infer G> ? G : never;

export type RuntimeReducer<
  G extends RuntimeGenerics,
  MC extends RuntimeMachineContext<G> = RuntimeMachineContext<G>
> = (
  state: MC["state"],
  action: MachineActionObject<MC, keyof MC["actions"]>
) => void;

export type RuntimeMachineContext<G extends RuntimeGenerics> = MachineContext<
  RuntimeState<G>,
  G["actions"]
>;

export type RuntimeModuleAPI<G extends RuntimeGenerics> = {
  events: RuntimeEffects<G>;
  thisCardId?: CardId;
  cloneCard: (card: RuntimeCard<G>) => RuntimeCard<G>;
  random: () => number;
};

export type GameRuntime<G extends RuntimeGenerics> = Machine<
  RuntimeMachineContext<G>
>;

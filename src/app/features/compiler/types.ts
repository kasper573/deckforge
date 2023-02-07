import type { ZodObject, ZodType } from "zod";
import type {
  MachineActions,
  MachineEffects,
  MachineMiddleware,
} from "../../../lib/machine/MachineAction";
import type { MachineContext } from "../../../lib/machine/MachineContext";
import type { NominalString } from "../../../lib/ts-extensions/NominalString";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import type { CardId, DeckId } from "../../../api/services/game/types";

export type CardInstanceId = NominalString<"CardInstanceId">;
export const cardInstanceIdType = zodNominalString<CardInstanceId>();

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

export const runtimePlayerIdType = zodNominalString<RuntimePlayerId>();
export type RuntimePlayerId = NominalString<"PlayerId">;

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
  deck: ZodType<RuntimeDeck<G>>;
  card: ZodObject<ZodShapeFor<RuntimeCard<G>>>;
  cardEffects: ZodType<Partial<RuntimeEffects<G>>>;
  cardPile: ZodType<RuntimeCard<G>[]>;
  player: ZodObject<ZodShapeFor<RuntimePlayer<G>>>;
  effects: ZodObject<ZodShapeFor<RuntimeEffects<G>>>;
  actions: ZodType<G["actions"]>;
  middleware: ZodType<RuntimeMiddleware<G>>;
  createInitialState: RuntimeStateFactory<G>;
}

export type RuntimeStateFactory<G extends RuntimeGenerics> = (options: {
  decks: RuntimeDeck<G>[];
  createPlayer: () => RuntimePlayer<G>;
}) => RuntimeState<G>;

export type PropRecord = Record<string, unknown>;

export type RuntimeGenericsFor<T extends RuntimeDefinition> =
  T extends RuntimeDefinition<infer G> ? G : never;

export type RuntimeMiddleware<G extends RuntimeGenerics> = MachineMiddleware<
  RuntimeMachineContext<G>
>;

export type RuntimeMachineContext<G extends RuntimeGenerics> = MachineContext<
  RuntimeState<G>,
  G["actions"]
>;

export type RuntimeScriptAPI<G extends RuntimeGenerics> = {
  actions: G["actions"];
  thisCardId?: CardInstanceId;
  cloneCard: (card: RuntimeCard<G>) => RuntimeCard<G>;
  random: () => number;
};

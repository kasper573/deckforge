import type { ZodType } from "zod";
import type { ZodObject } from "zod";
import type {
  MachineActions,
  MachineEffects,
} from "../../../lib/machine/MachineAction";
import type { MachineContext } from "../../../lib/machine/MachineContext";
import type { NominalString } from "../../../lib/ts-extensions/NominalString";
import type { ZodShapeFor } from "../../../lib/zod-extensions/ZodShapeFor";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import type { Pile } from "./apis/Pile";

export type CardInstanceId = NominalString<"CardInstanceId">;
export const cardInstanceIdType = zodNominalString<CardInstanceId>();

export interface RuntimeCard<G extends RuntimeGenerics> {
  id: CardInstanceId;
  name: string;
  properties: G["cardProps"];
  effects: Partial<RuntimeEffects<G>>;
}

export type RuntimePlayerId = NominalString<"PlayerId">;

export interface RuntimePlayer<G extends RuntimeGenerics> {
  id: RuntimePlayerId;
  properties: G["playerProps"];
  cards: {
    draw: Pile<RuntimeCard<G>>;
    hand: Pile<RuntimeCard<G>>;
    discard: Pile<RuntimeCard<G>>;
    deck: Pile<RuntimeCard<G>>;
  };
}

export interface RuntimeGenerics<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PlayerProps extends PropRecord = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardProps extends PropRecord = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Actions extends MachineActions = any
> {
  playerProps: PlayerProps;
  cardProps: CardProps;
  actions: Actions;
}

export interface RuntimeState<G extends RuntimeGenerics> {
  players: [RuntimePlayer<G>, RuntimePlayer<G>];
  winner?: RuntimePlayerId;
  currentPlayerId: RuntimePlayerId;
}

export type RuntimeEffects<G extends RuntimeGenerics> = MachineEffects<
  RuntimeMachineContext<G>
>;

export interface RuntimeDefinition<
  G extends RuntimeGenerics = RuntimeGenerics
> {
  state: ZodType<RuntimeState<G>>;
  card: ZodObject<ZodShapeFor<RuntimeCard<G>>>;
  cardPile: ZodType<Pile<RuntimeCard<G>>>;
  player: ZodType<RuntimePlayer<G>>;
  effects: ZodObject<ZodShapeFor<RuntimeEffects<G>>>;
  actions: ZodType<G["actions"]>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropRecord = Record<string, any>;

export type RuntimeGenericsFor<T extends RuntimeDefinition> =
  T extends RuntimeDefinition<infer G> ? G : never;

export type RuntimeMachineContext<G extends RuntimeGenerics> = MachineContext<
  RuntimeState<G>,
  G["actions"]
>;

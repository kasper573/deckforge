import type { ZodObject, ZodType } from "zod";
import { z } from "zod";
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
import type { Pile } from "./apis/Pile";

export type CardInstanceId = NominalString<"CardInstanceId">;
export const cardInstanceIdType = zodNominalString<CardInstanceId>();

export interface RuntimeCard<G extends RuntimeGenerics> {
  id: CardInstanceId;
  typeId: CardId;
  name: string;
  properties: G["cardProps"];
  effects: Partial<RuntimeEffects<G>>;
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
    draw: Pile<RuntimeCard<G>>;
    hand: Pile<RuntimeCard<G>>;
    discard: Pile<RuntimeCard<G>>;
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

export const runtimeStatusType = z.union([
  z.object({ type: z.literal("idle") }),
  z.object({ type: z.literal("battle") }),
  z.object({ type: z.literal("result"), winner: runtimePlayerIdType }),
]);

export type RuntimeStatus = z.infer<typeof runtimeStatusType>;

export interface RuntimeState<G extends RuntimeGenerics> {
  decks: RuntimeDeck<G>[];
  players: [RuntimePlayer<G>, RuntimePlayer<G>];
  status: RuntimeStatus;
  currentPlayerId: RuntimePlayerId;
}

export type RuntimeEffects<G extends RuntimeGenerics> = MachineEffects<
  RuntimeMachineContext<G>
>;

export interface RuntimeDefinition<
  G extends RuntimeGenerics = RuntimeGenerics
> {
  state: ZodType<RuntimeState<G>>;
  status: typeof runtimeStatusType;
  deck: ZodType<RuntimeDeck<G>>;
  card: ZodObject<ZodShapeFor<RuntimeCard<G>>>;
  cardPile: ZodType<Pile<RuntimeCard<G>>>;
  player: ZodType<RuntimePlayer<G>>;
  effects: ZodObject<ZodShapeFor<RuntimeEffects<G>>>;
  actions: ZodType<G["actions"]>;
  middleware: ZodType<RuntimeMiddleware<G>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PropRecord = Record<string, any>;

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

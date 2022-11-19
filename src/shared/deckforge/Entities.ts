import type {
  SelfExpression,
  MachineEventHandler,
} from "../machine/MachineEvent";
import type { MachineContext } from "../machine/MachineContext";
import type { Id } from "./createId";

export type PlayerId = Id<"PlayerId">;
export interface Player<Context extends MachineContext> {
  id: PlayerId;
  items: Item<Context>[];
  deck: Deck<Context>;
}

export type ItemId = Id<"ItemId">;
export interface Item<Context extends MachineContext> {
  id: ItemId;
  effects: Effects<Context>;
}

export type CardId = Id<"CardId">;
export interface Card<Context extends MachineContext> {
  id: CardId;
  playable: SelfExpression<Context, boolean, Card<Context>>;
  effects: Effects<Context>;
}

export type Deck<Context extends MachineContext> = Card<Context>[];

export type Effects<Context extends MachineContext> = {
  [EventName in keyof Context["events"]]?: MachineEventHandler<
    Context["state"],
    Context["events"][EventName]
  >;
};

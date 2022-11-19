import type {
  SelfExpression,
  MachineEventHandler,
} from "../machine/MachineEvent";
import type { MachineContext as EntityContext } from "../machine/MachineContext";
import type { Id } from "./createId";

export type PlayerId = Id<"PlayerId">;
export interface Player<Context extends EntityContext> {
  id: PlayerId;
  items: Item<Context>[];
  deck: Deck<Context>;
  piles: CardPiles<Context, "hand" | "discard" | "draw">;
  health: number;
}

export type ItemId = Id<"ItemId">;
export interface Item<Context extends EntityContext> {
  id: ItemId;
  effects: Effects<Context>;
}

export type CardId = Id<"CardId">;
export interface Card<Context extends EntityContext> {
  id: CardId;
  playable: SelfExpression<Context, boolean, Card<Context>>;
  effects: Effects<Context>;
}

export type CardPiles<
  Context extends EntityContext,
  PileNames extends string
> = Record<PileNames, Card<Context>[]>;

export type Deck<Context extends EntityContext> = Card<Context>[];

export type Effects<Context extends EntityContext> = {
  [EventName in keyof Context["events"]]?: Iterable<
    MachineEventHandler<Context["state"], Context["events"][EventName]>
  >;
};

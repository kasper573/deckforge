import type { MachineEventHandler } from "../machine/MachineEvent";
import type { Id } from "./createId";
import type { RuntimeEvents, RuntimeState } from "./Runtime";

export type PlayerId = Id<"PlayerId">;
export interface Player {
  id: PlayerId;
  items: Item[];
  deck: Deck;
  piles: CardPiles<"hand" | "discard" | "draw">;
  health: number;
}

export type ItemId = Id<"ItemId">;
export interface Item {
  id: ItemId;
  effects: Effects;
}

export type CardId = Id<"CardId">;
export interface Card {
  id: CardId;
  effects: Effects;
}

export type CardPiles<PileNames extends string> = Record<PileNames, Card[]>;

export type Deck = Card[];

export type Effects = {
  [EventName in keyof RuntimeEvents]?: Iterable<
    MachineEventHandler<RuntimeState, RuntimeEvents[EventName]>
  >;
};

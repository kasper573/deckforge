import type { EventHandlerMap, SelfExpression } from "../machine/Event";
import type { RuntimeContext } from "./RuntimeContext";
import type { Id } from "./createId";

export interface Battle<RC extends RuntimeContext> {
  turn: number;
}

export type CardPile<RC extends RuntimeContext, Names extends string> = Record<
  Names,
  Card<RC>[]
>;

export type PlayerId = Id<"PlayerId">;

export interface Player<RC extends RuntimeContext> {
  id: PlayerId;
  items: Item<RC>[];
  deck: Deck<RC>;
  props: RC["playerProps"];
}

export interface BattleMember<RC extends RuntimeContext> {
  player: Player<RC>;
  cardPiles: CardPile<RC, RC["playerCardPiles"]>;
}

export type BattleTeam<RC extends RuntimeContext> = BattleMember<RC>[];
export type CardId = Id<"CardId">;

export interface Card<RC extends RuntimeContext> {
  id: CardId;
  playable: SelfExpression<RC, boolean, Card<RC>>;
  effects: EventHandlerMap<RC>;
}

export interface Deck<RC extends RuntimeContext> {
  cards: Card<RC>[];
  props: RC["deckProps"];
}

export type ItemId = Id<"ItemId">;

export interface Item<RC extends RuntimeContext> {
  id: ItemId;
  effects: EventHandlerMap<RC>;
}

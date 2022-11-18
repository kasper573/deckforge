import type { Id } from "../createId";
import type { Generics } from "./Generics";
import type { EventExpressions, SelfExpression } from "./Expression";

export type CardId = Id<"CardId">;

export interface Card<G extends Generics> {
  id: CardId;
  cost: SelfExpression<G, number, Card<G>>;
  playable: SelfExpression<G, boolean, Card<G>>;
  effects: EventExpressions<G>;
  props: G["cardProps"];
}

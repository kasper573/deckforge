import type { Id } from "../createId";
import type { Generics } from "./Generics";
import type { EventExpressions, SelfExpression } from "./Expression";

export type CardId = Id<"CardId">;

export interface Card<G extends Generics> {
  id: CardId;
  playable: SelfExpression<G, boolean, Card<G>>;
  effects: EventExpressions<G>;
  props: G["cardProps"];
}

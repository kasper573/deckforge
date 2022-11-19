import type { Id } from "../createId";
import type { RuntimeContext } from "./RuntimeContext";
import type { EventExpressions, SelfExpression } from "./Expression";

export type CardId = Id<"CardId">;

export interface Card<RC extends RuntimeContext> {
  id: CardId;
  playable: SelfExpression<RC, boolean, Card<RC>>;
  effects: EventExpressions<RC>;
  props: RC["cardProps"];
}

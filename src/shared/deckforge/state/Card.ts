import type { Id } from "../createId";
import type { RuntimeContext } from "./RuntimeContext";
import type { SelfExpression } from "./Expression";
import type { EventHandlerExpressions } from "./EventHandler";

export type CardId = Id<"CardId">;

export interface Card<RC extends RuntimeContext> {
  id: CardId;
  playable: SelfExpression<RC, boolean, Card<RC>>;
  effects: EventHandlerExpressions<RC>;
  props: RC["cardProps"];
}

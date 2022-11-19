import type { Id } from "../createId";
import type { RuntimeContext } from "./RuntimeContext";
import type { EventHandlerExpressions } from "./EventHandler";

export type ItemId = Id<"ItemId">;

export interface Item<RC extends RuntimeContext> {
  id: ItemId;
  effects: EventHandlerExpressions<RC>;
  props: RC["cardProps"];
}

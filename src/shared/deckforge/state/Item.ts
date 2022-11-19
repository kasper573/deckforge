import type { Id } from "../createId";
import type { EventExpressions } from "./Expression";
import type { RuntimeContext } from "./RuntimeContext";

export type ItemId = Id<"ItemId">;

export interface Item<RC extends RuntimeContext> {
  id: ItemId;
  effects: EventExpressions<RC>;
  props: RC["cardProps"];
}

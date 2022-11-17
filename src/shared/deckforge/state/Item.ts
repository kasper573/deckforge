import type { Id } from "../createId";
import type { EventExpressions } from "./Expression";
import type { Generics } from "./Generics";

export type ItemId = Id<"ItemId">

export interface Item<G extends Generics> {
  id: ItemId;
  name: string;
  type: G["itemTypes"];
  effects: EventExpressions<G["events"]>;
}

import type { Id } from "../createId";
import type { Deck } from "./Deck";
import type { Item } from "./Item";
import type { RuntimeContext } from "./RuntimeContext";

export type PlayerId = Id<"PlayerId">;

export interface Player<RC extends RuntimeContext> {
  id: PlayerId;
  items: Item<RC>[];
  deck: Deck<RC>;
  props: RC["playerProps"];
}

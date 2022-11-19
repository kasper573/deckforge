import type { Id } from "../createId";
import type { Deck } from "./Deck";
import type { Item } from "./Item";
import type { Generics } from "./Generics";

export type PlayerId = Id<"PlayerId">;

export interface Player<G extends Generics> {
  id: PlayerId;
  items: Item<G>[];
  deck: Deck<G>;
  props: G["playerProps"];
}

import type { Deck } from "./Deck";
import type { Item } from "./Item";
import type { Generics } from "./Generics";

export interface Player<G extends Generics> {
  items: Item<G>[];
  deck: Deck<G>;
  props: G["playerProps"];
}

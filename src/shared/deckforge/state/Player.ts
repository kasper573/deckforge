import type { Deck } from "./Deck";
import type { Variable } from "./Variable";
import type { Item } from "./Item";
import type { Generics } from "./Generics";

export interface Player<G extends Generics> {
  name: string;
  items: Item<G>[];
  resources: Record<G["playerResources"], Variable<number>>;
  deck: Deck<G>;
}

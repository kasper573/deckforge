import type { RuntimeContext } from "./RuntimeContext";
import type { CardPile } from "./CardPile";

export interface Battle<RC extends RuntimeContext> {
  turn: number;
  cardPiles: CardPile<RC, RC["battleCardPiles"]>;
  props: RC["battleProps"];
}

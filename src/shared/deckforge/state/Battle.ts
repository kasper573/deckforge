import type { RuntimeContext } from "./RuntimeContext";
import type { CardPile } from "./CardPile";
import type { PlayerId } from "./Player";

export interface Battle<RC extends RuntimeContext> {
  turn: number;
  cardPiles: CardPile<RC, RC["battleCardPiles"]>;
  winningPlayerId?: PlayerId;
  props: RC["battleProps"];
}

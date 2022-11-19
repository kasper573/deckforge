import type { Generics } from "./Generics";
import type { CardPile } from "./CardPile";
import type { PlayerId } from "./Player";

export interface Battle<G extends Generics> {
  turn: number;
  cardPiles: CardPile<G, G["battleCardPiles"]>;
  winningPlayerId?: PlayerId;
  props: G["battleProps"];
}

import type { Player } from "./Player";
import type { Generics } from "./Generics";
import type { CardPile } from "./CardPile";

export interface BattleMember<G extends Generics> {
  player: Player<G>;
  cardPiles: CardPile<G, G["playerCardPiles"]>;
}

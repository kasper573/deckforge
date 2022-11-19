import type { Player } from "./Player";
import type { RuntimeContext } from "./RuntimeContext";
import type { CardPile } from "./CardPile";

export interface BattleMember<RC extends RuntimeContext> {
  player: Player<RC>;
  cardPiles: CardPile<RC, RC["playerCardPiles"]>;
}

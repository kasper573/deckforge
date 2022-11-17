import type { Player } from "./Player";
import type { Generics } from "./Generics";
import type { Card } from "./Card";

export interface BattleMember<G extends Generics> {
  player: Player<G>;
  cardPiles: Record<G["individualCardPiles"], Card<G>[]>;
}

import type { BattleTeam } from "./BattleTeam";
import type { Generics } from "./Generics";
import type { CardPile } from "./CardPile";

export interface Battle<G extends Generics> {
  turn: number;
  teams: BattleTeam<G>[];
  cardPiles: CardPile<G, G["battleCardPiles"]>;
  props: G["battleProps"];
}

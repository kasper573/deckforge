import type { BattleTeam } from "./BattleTeam";
import type { Generics } from "./Generics";
import type { Card } from "./Card";

export interface Battle<G extends Generics> {
  turn: number;
  teams: BattleTeam<G>[];
  sharedCardPiles: Record<G["sharedCardPiles"], Card<G>[]>;
}

import type { Generics } from "./Generics";
import type { Battle } from "./Battle";
import type { Player } from "./Player";

export interface RuntimeState<G extends Generics> {
  currentBattle?: Battle<G>;
  players: Player<G>[];
}

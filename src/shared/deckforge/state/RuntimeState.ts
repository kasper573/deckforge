import type { RuntimeContext } from "./RuntimeContext";
import type { Battle } from "./Battle";
import type { Player } from "./Player";

export interface RuntimeState<RC extends RuntimeContext> {
  currentBattle?: Battle<RC>;
  players: Player<RC>[];
  settings: RC["settings"];
}

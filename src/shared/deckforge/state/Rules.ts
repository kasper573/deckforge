import type { Generics } from "./Generics";
import type { Expression } from "./Expression";
import type { Battle } from "./Battle";

export interface Rules<G extends Generics> {
  isBattleWon: Expression<boolean, Battle<G>>;
}

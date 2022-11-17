import type { BattleMember } from "./BattleMember";
import type { Generics } from "./Generics";

export type BattleTeam<G extends Generics> = BattleMember<G>[];

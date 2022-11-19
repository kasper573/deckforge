import type { BattleMember } from "./BattleMember";
import type { RuntimeContext } from "./RuntimeContext";

export type BattleTeam<RC extends RuntimeContext> = BattleMember<RC>[];

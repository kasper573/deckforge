import type { Id } from "../createId";
import type { Expression } from "./Expression";
import type { Generics } from "./Generics";
import type { EventExpressions } from "./Expression";

export type CardId = Id<"CardId">

export interface Card<G extends Generics> {
  id: CardId;
  name: string;
  type: G["cardTypes"];
  cost: Expression<number>;
  canBePlayed: Expression<boolean>;
  effects: EventExpressions<G["events"]>;
}

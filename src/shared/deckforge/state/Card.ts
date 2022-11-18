import type { Id } from "../createId";
import type { Generics } from "./Generics";
import type { EventExpressions } from "./Expression";
import type { ReadonlyExpression } from "./Expression";

export type CardId = Id<"CardId">;

export interface Card<G extends Generics> {
  id: CardId;
  name: string;
  type: G["cardTypes"];
  cost: ReadonlyExpression<G, number>;
  playable: ReadonlyExpression<G, boolean>;
  effects: EventExpressions<G>;
}

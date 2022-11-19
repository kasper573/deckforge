import type { Card } from "./Card";
import type { RuntimeContext } from "./RuntimeContext";

export type CardPile<RC extends RuntimeContext, Names extends string> = Record<
  Names,
  Card<RC>[]
>;

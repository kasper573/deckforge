import type { Card } from "./Card";
import type { Generics } from "./Generics";

export type CardPile<G extends Generics, Names extends string> = Record<
  Names,
  Card<G>[]
>;

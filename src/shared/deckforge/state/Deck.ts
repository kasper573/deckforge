import type { Card } from "./Card";
import type { Generics } from "./Generics";

export interface Deck<G extends Generics> {
  name: string;
  cards: Card<G>[];
}

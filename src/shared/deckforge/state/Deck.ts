import type { Card } from "./Card";
import type { Generics } from "./Generics";

export interface Deck<G extends Generics> {
  cards: Card<G>[];
  props: G["deckProps"];
}

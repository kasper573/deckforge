import type { Card } from "./Card";
import type { RuntimeContext } from "./RuntimeContext";

export interface Deck<RC extends RuntimeContext> {
  cards: Card<RC>[];
  props: RC["deckProps"];
}

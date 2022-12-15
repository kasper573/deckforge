import type { Card } from "../../../api/services/game/types";
import { RuntimeCard } from "../runtime/Entities";
import { compileEffectsFactory } from "./compileEffectsFactory";

export function compileCard(card: Card): RuntimeCard {
  class CompiledCard extends RuntimeCard {
    constructor() {
      super({
        id: card.cardId,
        name: card.name,
      });
      const result = compileEffectsFactory(card.code);
      if (!result.success) {
        throw result.error;
      }
      this.effects = result.data(card);
    }
  }

  return new CompiledCard();
}

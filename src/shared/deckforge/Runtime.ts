import { Machine } from "../machine/Machine";
import type { MachineContext } from "../machine/MachineContext";
import type { MachineEventHandlerSelector } from "../machine/MachineEvent";
import type { CardId, Player, PlayerId } from "./Entities";

export function createRuntime(state: RuntimeState) {
  return new Machine(state, selectEffects);
}

const selectEffects: MachineEventHandlerSelector<RuntimeContext> = function* (
  { p1, p2 },
  eventName
) {
  for (const player of [p1, p2]) {
    for (const item of player.items) {
      const itemEffects = item.effects[eventName];
      if (itemEffects) {
        for (const effect of itemEffects) {
          yield effect;
        }
      }
    }
    for (const card of player.deck) {
      const cardEffects = card.effects[eventName];
      if (cardEffects) {
        for (const effect of cardEffects) {
          yield effect;
        }
      }
    }
  }
};

export type RuntimeContext = MachineContext<RuntimeState, RuntimeEvents>;

export interface RuntimeState {
  p1: Player;
  p2: Player;
  winner?: PlayerId;
}

export type RuntimeEvents = {
  drawCard: (id: PlayerId) => void;
  playCard: (input: {
    playerId: PlayerId;
    cardId: CardId;
    targetId: PlayerId;
  }) => void;
  endTurn: () => void;
};

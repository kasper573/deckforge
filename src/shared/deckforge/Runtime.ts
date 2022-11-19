import type { MachineEventHandlerSelector } from "../machine/MachineEvent";
import { Machine } from "../machine/Machine";
import type { MachineContext } from "../machine/MachineContext";
import type { MachineEventHandlerMap } from "../machine/MachineEvent";
import type {
  Battle,
  BattleId,
  BattleMember,
  Card,
  CardId,
  Deck,
  EntityCollection,
  Player,
  PlayerId,
} from "./Entities";
import { createId } from "./createId";

export interface RuntimeState {
  players: EntityCollection<Player>;
  cards: EntityCollection<Card>;
  decks: EntityCollection<Deck>;
  battles: EntityCollection<Battle>;
}

export type RuntimeEvents = {
  startBattle(input: { member1: PlayerId; member2: PlayerId }): void;
  playCard(input: {
    battleId: BattleId;
    playerId: PlayerId;
    cardId: CardId;
    targetId: PlayerId;
  }): void;
  drawCard(input: { battleId: BattleId; playerId: PlayerId }): void;
  endTurn(id: BattleId): void;
};

const globalEventHandlers: MachineEventHandlerMap<RuntimeContext> = {
  startBattle(state, { member1, member2 }) {
    const id = createId<BattleId>();
    state.battles.set(id, {
      id,
      member1: createBattleMember(member1),
      member2: createBattleMember(member2),
    });
  },
  endTurn(state) {},
  drawCard(state) {},
  playCard(state, id) {},
};

function createBattleMember(playerId: PlayerId): BattleMember {
  return {
    playerId,
    cards: {
      hand: [],
      draw: [],
      discard: [],
    },
  };
}

export type RuntimeContext = MachineContext<RuntimeState, RuntimeEvents>;

export type Runtime = ReturnType<typeof createRuntime>;

export function createRuntime(initialState: RuntimeState) {
  return new Machine(initialState, globalEventHandlers, selectEffects);
}

const selectEffects: MachineEventHandlerSelector<RuntimeContext> = function* (
  state,
  eventName
) {
  for (const card of state.cards.values()) {
    yield* card.effects[eventName] ?? [];
  }
};

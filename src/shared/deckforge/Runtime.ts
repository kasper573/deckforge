import type {
  MachineEventHandlerMap,
  MachineEventHandlerSelector,
} from "../machine/MachineEvent";
import { Machine } from "../machine/Machine";
import type { MachineContext } from "../machine/MachineContext";
import { pull } from "../util";
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
  discardCard(input: {
    battleId: BattleId;
    playerId: PlayerId;
    cardId: CardId;
  }): void;
  endTurn(id: BattleId): void;
};

const globalEventHandlers: MachineEventHandlerMap<RuntimeContext> = {
  startBattle(state, { member1, member2 }) {
    const battleId = createId<BattleId>();
    const player1Deck = pull(state.decks, pull(state.players, member1).deck);
    const player2Deck = pull(state.decks, pull(state.players, member2).deck);
    state.battles.set(battleId, {
      id: battleId,
      member1: createBattleMember(member1, player1Deck),
      member2: createBattleMember(member2, player2Deck),
    });
  },
  endTurn(state, battleId) {
    const battle = pull(state.battles, battleId);
    const player1 = pull(state.players, battle.member1.playerId);
    const player2 = pull(state.players, battle.member2.playerId);
    if (player1.health <= 0) {
      battle.winner = player2.id;
    } else if (player2.health <= 0) {
      battle.winner = player1.id;
    }
  },
  drawCard(state, { battleId, playerId }) {
    const battle = pull(state.battles, battleId);
    const member = selectBattleMember(battle, playerId);
    const card = member.cards.draw.shift();
    if (!card) {
      throw new Error(`No cards to draw`);
    }
    member.cards.hand.push(card);
  },
  playCard(state, payload) {
    // The card effect is handled by state derived event handlers
    // All we need to do here globally is to discard the card
    globalEventHandlers.discardCard?.(state, payload);
  },
  discardCard(state, { battleId, cardId, playerId }) {
    const battle = pull(state.battles, battleId);
    const member = [battle.member1, battle.member2].find(
      (member) => member.playerId === playerId
    );
    if (!member) {
      throw new Error(`Player ${playerId} not in battle ${battleId}`);
    }
    const index = member.cards.hand.indexOf(cardId);
    if (index === -1) {
      throw new Error(`Card ${cardId} not in hand`);
    }
    member.cards.hand.splice(index, 1);
    member.cards.discard.push(cardId);
  },
};

function selectBattleMember(battle: Battle, playerId: PlayerId): BattleMember {
  const member = [battle.member1, battle.member2].find(
    (member) => member.playerId === playerId
  );
  if (!member) {
    throw new Error(`Player ${playerId} not in battle ${battle.id}`);
  }
  return member;
}

function createBattleMember(playerId: PlayerId, deck: Deck): BattleMember {
  return {
    playerId,
    cards: {
      hand: [],
      draw: deck.cards,
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

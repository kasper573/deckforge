import {
  createMachine,
  createMachineActions,
} from "../../../lib/machine/Machine";
import { pull } from "../../../lib/ts-extensions/pull";
import type { MachineContext } from "../../../lib/machine/MachineContext";
import { RuntimeBattle, RuntimeBattleMember } from "./Entities";
import type {
  RuntimeBattleId,
  RuntimeCard,
  RuntimeCardId,
  RuntimeDeck,
  EntityCollection,
  RuntimePlayer,
  RuntimePlayerId,
} from "./Entities";

export interface GameState {
  players: EntityCollection<RuntimePlayer>;
  cards: EntityCollection<RuntimeCard>;
  decks: EntityCollection<RuntimeDeck>;
  battles: EntityCollection<RuntimeBattle>;
}

export type GameMachine = ReturnType<typeof createGame>;

export type GameActions = typeof actions;

export type GameContext = MachineContext<GameState, GameActions>;

const actions = createMachineActions<GameState>()({
  startBattle(state, [player1, player2]: [RuntimePlayerId, RuntimePlayerId]) {
    const player1Deck = pull(state.decks, pull(state.players, player1).deck);
    const player2Deck = pull(state.decks, pull(state.players, player2).deck);
    const battle = new RuntimeBattle(
      RuntimeBattleMember.from(player1, player1Deck),
      RuntimeBattleMember.from(player2, player2Deck)
    );
    state.battles.set(battle.id, battle);
    return battle.id;
  },
  endTurn(state, battleId: RuntimeBattleId) {
    const battle = pull(state.battles, battleId);
    const player1 = pull(state.players, battle.member1.playerId);
    const player2 = pull(state.players, battle.member2.playerId);
    if (player1.health <= 0) {
      battle.winner = player2.id;
    } else if (player2.health <= 0) {
      battle.winner = player1.id;
    }
  },
  drawCard(
    state,
    {
      battleId,
      playerId,
    }: { battleId: RuntimeBattleId; playerId: RuntimePlayerId }
  ) {
    const battle = pull(state.battles, battleId);
    const member = battle.selectMember(playerId);
    const card = member.cards.draw.shift();
    if (!card) {
      throw new Error(`No cards to draw`);
    }
    member.cards.hand.push(card);
  },
  playCard(context, payload: CardPayload & { targetId: RuntimePlayerId }) {
    // The card effect is handled by reactions
    // All we need to do here globally is to discard the card
    actions.discardCard(context, payload);
  },
  discardCard(state, { battleId, playerId, cardId }: CardPayload) {
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
});

export interface CardPayload {
  battleId: RuntimeBattleId;
  playerId: RuntimePlayerId;
  cardId: RuntimeCardId;
}

export function createGame(initialState: GameState) {
  return createMachine(initialState)
    .actions(actions)
    .reactions(function* (state, actionName) {
      for (const card of state.cards.values()) {
        yield* card.effects[actionName] ?? [];
      }
    })
    .build();
}

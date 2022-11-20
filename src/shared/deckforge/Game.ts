import { createMachine, createMachineActions } from "../machine/Machine";
import { pull } from "../util";
import type { MachineContext } from "../machine/MachineContext";
import { Battle, BattleMember } from "./Entities";
import type {
  BattleId,
  Card,
  CardId,
  Deck,
  EntityCollection,
  Player,
  PlayerId,
} from "./Entities";

export interface GameState {
  players: EntityCollection<Player>;
  cards: EntityCollection<Card>;
  decks: EntityCollection<Deck>;
  battles: EntityCollection<Battle>;
}

export type GameMachine = ReturnType<typeof createGame>;

export type GameActions = typeof actions;

export type GameContext = MachineContext<GameState, GameActions>;

const actions = createMachineActions<GameState>()({
  startBattle(state, [player1, player2]: [PlayerId, PlayerId]) {
    const player1Deck = pull(state.decks, pull(state.players, player1).deck);
    const player2Deck = pull(state.decks, pull(state.players, player2).deck);
    const battle = new Battle(
      BattleMember.from(player1, player1Deck),
      BattleMember.from(player2, player2Deck)
    );
    state.battles.set(battle.id, battle);
    return battle.id;
  },
  endTurn(state, battleId: BattleId) {
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
    { battleId, playerId }: { battleId: BattleId; playerId: PlayerId }
  ) {
    const battle = pull(state.battles, battleId);
    const member = battle.selectMember(playerId);
    const card = member.cards.draw.shift();
    if (!card) {
      throw new Error(`No cards to draw`);
    }
    member.cards.hand.push(card);
  },
  playCard(context, payload: CardPayload & { targetId: PlayerId }) {
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
  battleId: BattleId;
  playerId: PlayerId;
  cardId: CardId;
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

import type { z } from "zod";
import { without } from "lodash";
import {
  createMachine,
  createMachineActions,
} from "../../../lib/machine/Machine";
import type { MachineContext } from "../../../lib/machine/MachineContext";
import type { CardId } from "../../../api/services/game/types";
import { createRuntimeTypeDefs } from "./createTypeDefs";

const typeDefs = createRuntimeTypeDefs({
  playerProperties: {},
  cardProperties: {},
});

export type RuntimePlayerId = z.infer<typeof typeDefs.playerId>;
export type RuntimePlayer = z.infer<typeof typeDefs.player>;
export type RuntimeCard = z.infer<typeof typeDefs.card>;

export const gameStateType = typeDefs.state;

export type GameState = z.infer<typeof gameStateType>;

export type GameRuntime = ReturnType<typeof createGameRuntime>;

export type GameActions = typeof actions;

export type GameContext = MachineContext<GameState, GameActions>;

const actions = createMachineActions<GameState>()({
  startBattle(state) {
    state.winner = undefined;
    state.players.forEach(resetPlayerCards);
  },
  endTurn(state) {
    for (const player of state.players) {
      if (player.properties.health <= 0) {
        const anyOtherPlayer = without(state.players, player)[0];
        state.winner = anyOtherPlayer?.id;
        break;
      }
    }
  },
  drawCard(state, playerId: RuntimePlayerId) {
    const player = selectPlayer(state, playerId);
    const card = player.cards.draw.shift();
    if (!card) {
      throw new Error(`No cards to draw`);
    }
    player.cards.hand.push(card);
  },
  playCard(context, payload: CardPayload & { targetId: RuntimePlayerId }) {
    // The card effect is handled by reactions
    // All we need to do here globally is to discard the card
    actions.discardCard(context, payload);
  },
  discardCard(state, { playerId, cardId }: CardPayload) {
    const player = selectPlayer(state, playerId);
    const index = player.cards.hand.findIndex((c) => c.id === cardId);
    if (index === -1) {
      throw new Error(`Card ${cardId} not in hand`);
    }
    const [discardedCard] = player.cards.hand.splice(index, 1);
    player.cards.discard.push(discardedCard);
  },
});

function selectPlayer(state: GameState, playerId: RuntimePlayerId) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }
  return player;
}

function resetPlayerCards(player: RuntimePlayer) {
  const { cards } = player;
  cards.discard = [];
  cards.hand = [];
  cards.draw = cards.deck;
}

export interface CardPayload {
  playerId: RuntimePlayerId;
  cardId: CardId;
}

export function createGameRuntime(initialState: GameState) {
  return createMachine(initialState)
    .actions(actions)
    .reactions(function* (state, actionName) {
      for (const player of state.players) {
        const cards = Object.values(player.cards).flat();
        for (const card of cards) {
          if (card.effects[actionName]) {
            yield card.effects[actionName];
          }
        }
      }
    })
    .build();
}

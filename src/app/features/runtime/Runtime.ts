import { z } from "zod";
import { without } from "lodash";
import {
  createMachine,
  createMachineActions,
} from "../../../lib/machine/Machine";
import type { MachineContext } from "../../../lib/machine/MachineContext";
import type { CardId } from "../../../api/services/game/types";
import { cardIdType } from "../../../api/services/game/types";
import { createRuntimeMetaData, runtimeEvent } from "./createMetaData";

const { typeDefs, selectReactions } = createRuntimeMetaData({
  playerProperties: {},
  cardProperties: {},
  events: ({ playerId }) => {
    const cardPayload = z.object({
      playerId,
      cardId: cardIdType,
    });
    return {
      startBattle: runtimeEvent(),
      endTurn: runtimeEvent(),
      drawCard: runtimeEvent(playerId),
      playCard: runtimeEvent(cardPayload.and(z.object({ targetId: playerId }))),
      discardCard: runtimeEvent(cardPayload),
    };
  },
});

export type RuntimePlayerId = z.infer<typeof typeDefs.playerId>;
export type RuntimePlayer = z.infer<typeof typeDefs.player>;
export type RuntimeCard = z.infer<typeof typeDefs.card>;

export const gameStateType = typeDefs.state;

export type GameState = z.infer<typeof gameStateType>;

export type GameRuntime = ReturnType<typeof createGameRuntime>;

export type GameActions = z.infer<typeof typeDefs.effects>;

export type GameContext = MachineContext<GameState, GameActions>;

const actions = createMachineActions<GameState>()<GameActions>({
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
  drawCard(state, playerId) {
    const player = selectPlayer(state, playerId);
    const card = player.cards.draw.shift();
    if (!card) {
      throw new Error(`No cards to draw`);
    }
    player.cards.hand.push(card);
  },
  playCard(context, payload) {
    // The card effect is handled by reactions
    // All we need to do here globally is to discard the card
    actions.discardCard(context, payload);
  },
  discardCard(state, { playerId, cardId }) {
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
    .reactions(selectReactions)
    .build();
}

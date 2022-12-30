import { v4 } from "uuid";
import { z } from "zod";
import { without } from "lodash";
import {
  defineRuntime,
  deriveMachine,
  runtimeEvent,
} from "../compiler/defineRuntime";
import type { ZodTypesFor } from "../../../lib/zod-extensions/ZodShapeFor";
import type { RuntimePlayerId } from "../compiler/types";
import { cardInstanceIdType } from "../compiler/types";

it("1v1: can play a one card deck and win the game", () => {
  const card = createDamageCard(1);

  const game = createGameRuntime({
    players: [createPlayer(1, [card]), createPlayer(1, [card])],
  });

  game.execute((state) => {
    const [player1, player2] = state.players;
    game.actions.startBattle();
    game.actions.drawCard(player1.id);

    game.actions.playCard({
      playerId: player1.id,
      targetId: player2.id,
      cardId: player1.cards.hand[0].id,
    });

    game.actions.endTurn();
    expect(state.winner).toBe(player1.id);
  });
});

it("1v1: can play a two card deck and win the game", () => {
  const cards = [createDamageCard(1), createDamageCard(-1)];

  const game = createGameRuntime({
    players: [createPlayer(1, cards), createPlayer(1, cards)],
  });

  game.execute((state) => {
    const [player1, player2] = state.players;
    game.actions.startBattle();

    game.actions.drawCard(player1.id);
    game.actions.playCard({
      playerId: player1.id,
      targetId: player2.id,
      cardId: player1.cards.hand[0].id,
    });

    game.actions.endTurn();
    expect(state.winner).toBe(player1.id);
  });
});

function createPlayer(health: number, cards: Card[]): Player {
  return {
    id: v4() as Player["id"],
    properties: { health },
    cards: {
      deck: cards,
      hand: [],
      draw: [],
      discard: [],
    },
  };
}

function createDamageCard(damage: number): Card {
  const id = v4() as Card["id"];
  return {
    id,
    name: "Attack",
    properties: {},
    effects: {
      playCard(state, { targetId, cardId }) {
        if (id !== cardId) {
          return;
        }
        const target = state.players.find((p) => p.id === targetId);
        if (target) {
          target.properties.health -= damage;
        }
      },
    },
  };
}

const inMemoryDefinition = defineRuntime({
  playerProperties: {
    health: z.number(),
  },
  cardProperties: {},
  actions: ({ playerId }) => {
    const cardPayload = z.object({
      playerId,
      cardId: cardInstanceIdType,
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

type InMemoryDefinition = typeof inMemoryDefinition;
type InMemoryTypes = ZodTypesFor<InMemoryDefinition>;
type Player = InMemoryTypes["player"];
type Card = InMemoryTypes["card"];
type State = InMemoryTypes["state"];

const actions: InMemoryTypes["effects"] = {
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
};

function selectPlayer(state: State, playerId: RuntimePlayerId) {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error(`Player ${playerId} not found`);
  }
  return player;
}

function resetPlayerCards(player: Player) {
  const { cards } = player;
  cards.discard = [];
  cards.hand = [];
  cards.draw = cards.deck;
}

function createGameRuntime(initialState: State) {
  return deriveMachine(actions, initialState);
}

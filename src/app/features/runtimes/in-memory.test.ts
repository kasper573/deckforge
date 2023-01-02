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
import { createPile } from "../compiler/apis/Pile";
import type { CardId } from "../../../api/services/game/types";

it("1v1: can play a one card deck and win the game", () => {
  const card = createDamageCard(1);

  const p1 = createPlayer(1, [card]);
  const p2 = createPlayer(1, [card]);
  const game = createGameRuntime({
    players: [p1, p2],
    status: { type: "idle" },
    currentPlayerId: p1.id,
  });

  game.execute((state) => {
    const [player1, player2] = state.players;
    game.actions.startBattle();
    game.actions.drawCard(player1.id);

    game.actions.playCard({
      playerId: player1.id,
      targetId: player2.id,
      cardId: player1.cards.hand.at(0)!.id,
    });

    game.actions.endTurn();
    expect(state.status).toEqual({ type: "result", winner: player1.id });
  });
});

it("1v1: can play a two card deck and win the game", () => {
  const cards = [createDamageCard(1), createDamageCard(-1)];

  const p1 = createPlayer(1, cards);
  const p2 = createPlayer(1, cards);
  const game = createGameRuntime({
    players: [p1, p2],
    status: { type: "idle" },
    currentPlayerId: p1.id,
  });

  game.execute((state) => {
    const [player1, player2] = state.players;
    game.actions.startBattle();

    game.actions.drawCard(player1.id);
    game.actions.playCard({
      playerId: player1.id,
      targetId: player2.id,
      cardId: player1.cards.hand.at(0)!.id,
    });

    game.actions.endTurn();
    expect(state.status).toEqual({ type: "result", winner: player1.id });
  });
});

function createPlayer(health: number, cards: Card[]): Player {
  return {
    id: v4() as Player["id"],
    properties: { health },
    cards: {
      deck: createPile(cards),
      hand: createPile(),
      draw: createPile(),
      discard: createPile(),
    },
  };
}

function createDamageCard(damage: number): Card {
  const id = v4() as Card["id"];
  return {
    id,
    typeId: id as CardId,
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
    state.status = { type: "battle" };
    state.players.forEach(resetPlayerCards);
  },
  endTurn(state) {
    for (const player of state.players) {
      if (player.properties.health <= 0) {
        const anyOtherPlayer = without(state.players, player)[0];
        state.status = { type: "result", winner: anyOtherPlayer.id };
        break;
      }
    }
  },
  drawCard(state, playerId) {
    const {
      cards: { draw, hand },
    } = selectPlayer(state, playerId);
    draw.move(1, hand);
  },
  playCard(context, payload) {
    // The card effect is handled by reactions
    // All we need to do here globally is to discard the card
    actions.discardCard(context, payload);
  },
  discardCard(state, { playerId, cardId }) {
    const {
      cards: { hand, discard },
    } = selectPlayer(state, playerId);
    const card = hand.find((c) => c.id === cardId);
    if (!card) {
      throw new Error(`Card ${cardId} not in hand`);
    }
    hand.remove(card);
    discard.add(card);
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
  cards.discard.clear();
  cards.hand.clear();
  cards.draw = cards.deck;
}

function createGameRuntime(initialState: State) {
  return deriveMachine(actions, initialState).build();
}

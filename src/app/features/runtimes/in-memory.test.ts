import { v4 } from "uuid";
import { z } from "zod";
import { without } from "lodash";
import { immerable } from "immer";
import {
  defineRuntime,
  deriveMachine,
  runtimeEvent,
} from "../compiler/defineRuntime";
import type { ZodTypesFor } from "../../../lib/zod-extensions/ZodShapeFor";
import type { CardInstanceId, RuntimePlayerId } from "../compiler/types";
import { cardInstanceIdType } from "../compiler/types";
import { createPile } from "../compiler/apis/Pile";
import type { CardId, DeckId } from "../../../api/services/game/types";

it("1v1: can play a one card deck and win the game", () => {
  const card = new TestCard(1);
  const deck = createDeck([card]);

  const p1 = createPlayer(1, deck.id);
  const p2 = createPlayer(1, deck.id);
  const game = createGameRuntime({
    decks: [deck],
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
      cardId: player1.board.hand.at(0)!.id,
    });

    game.actions.endTurn();
    expect(state.status).toEqual({ type: "result", winner: player1.id });
  });
});

it("1v1: can play a two card deck and win the game", () => {
  const cards = [new TestCard(1), new TestCard(-1)];
  const deck = createDeck(cards);

  const p1 = createPlayer(1, deck.id);
  const p2 = createPlayer(1, deck.id);
  const game = createGameRuntime({
    decks: [deck],
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
      cardId: player1.board.hand.at(0)!.id,
    });

    game.actions.endTurn();
    expect(state.status).toEqual({ type: "result", winner: player1.id });
  });
});

function createDeck(cards: Card[]): Deck {
  const id = v4() as DeckId;
  return {
    id,
    name: "Test Deck",
    cards,
  };
}

function createPlayer(health: number, deckId: DeckId): Player {
  return {
    id: v4() as Player["id"],
    properties: { health },
    deckId,
    board: {
      hand: createPile(),
      draw: createPile(),
      discard: createPile(),
    },
  };
}

class TestCard implements Card {
  [immerable] = true;

  constructor(public readonly damage: number) {}

  id = v4() as CardInstanceId;
  typeId = "damage" as CardId;
  name = "Attack";
  properties = {};
  effects: Card["effects"] = {
    playCard: (state, { targetId, cardId }) => {
      if (this.id !== cardId) {
        return;
      }
      const target = state.players.find((p) => p.id === targetId);
      if (target) {
        target.properties.health -= this.damage;
      }
    },
  };

  static clone(card: TestCard) {
    return new TestCard(card.damage);
  }
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
type Deck = InMemoryTypes["deck"];
type Card = InMemoryTypes["card"];
type State = InMemoryTypes["state"];

const actions: InMemoryTypes["effects"] = {
  startBattle(state) {
    state.status = { type: "battle" };
    state.players.forEach((player) => {
      const deck = state.decks.find((d) => d.id === player.deckId)!;
      resetPlayerCards(player, deck);
    });
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
      board: { draw, hand },
    } = selectPlayer(state, playerId);
    draw.move(1, hand);
  },
  playCard(context, payload) {
    // The card effect is handled by reactions
    // All we need to do here globally is to discard the card
    return () => actions.discardCard(context, payload);
  },
  discardCard(state, { playerId, cardId }) {
    const {
      board: { hand, discard },
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

function resetPlayerCards(player: Player, deck: Deck) {
  const { board } = player;
  board.discard.clear();
  board.hand.clear();
  board.draw.reset(deck.cards.map((c) => TestCard.clone(c as TestCard)));
}

function createGameRuntime(initialState: State) {
  return deriveMachine(actions, initialState).build();
}

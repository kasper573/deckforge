import { v4 } from "uuid";
import type { RuntimeCard, RuntimePlayer } from "./Runtime";
import { createGameRuntime } from "./Runtime";

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

function createPlayer(health: number, cards: RuntimeCard[]): RuntimePlayer {
  return {
    id: v4() as RuntimePlayer["id"],
    properties: { health },
    cards: {
      deck: cards,
      hand: [],
      draw: [],
      discard: [],
    },
  };
}

function createDamageCard(damage: number): RuntimeCard {
  const id = v4() as RuntimeCard["id"];
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

import type { CardId, Player, PlayerId } from "./Entities";
import { createRuntime } from "./Runtime";

// a 1v1 game consisting of draw, discard, health and mana mechanics

describe("versus", () => {
  it("can play a game", () => {
    // Define starting state:
    // - start a game with 2 players with 1 health each
    // - define winning condition as having 0 health
    // - each player has their own deck
    // - each deck contains 1 attack card that does 1 damage to the opponent
    // - Let player 1 start

    // Trigger events:
    // - Player 1 draws and plays their one card.

    // Expect results:
    // - Expect the game to have ended with player 1 as victor

    const runtime = createRuntime({
      p1: mockPlayer(),
      p2: mockPlayer(),
    });

    runtime.events.drawCard(runtime.state.p1.id);

    runtime.events.playCard({
      playerId: runtime.state.p1.id,
      targetId: runtime.state.p2.id,
      cardId: runtime.state.p1.piles.hand[0]!.id,
    });

    runtime.events.endTurn();

    expect(runtime.state.winner).toBe(runtime.state.p1.id);
  });
});

function mockPlayer(): Player {
  return {
    id: "player1" as PlayerId,
    items: [],
    health: 1,
    deck: [
      {
        id: "attack" as CardId,
        effects: {
          playCard: [
            (state, { targetId }) => {
              const target = [state.p1, state.p2].find(
                (p) => p.id === targetId
              );
              if (target) {
                target.health -= 1;
              }
            },
          ],
        },
      },
    ],
    piles: {
      hand: [],
      discard: [],
      draw: [],
    },
  };
}

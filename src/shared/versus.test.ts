// a 1v1 game consisting of draw, discard, health and mana mechanics
import { Runtime } from "./deckforge/Runtime";

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

    const runtime = new Runtime<MyRuntimeContext>({});
    const [[member1] = []] = runtime.state.currentBattle!.teams;
    runtime.events.drawCard(member1.player.id);
    runtime.events.playCard(member1.player.id, member1.cardPiles.hand[0].id);
    expect(runtime.state.currentBattle.winningPlayerId).toBe(member1.player.id);
  });
});

interface MyRuntimeContext {
  events: MyEvents;
  settings: unknown;
  playerProps: unknown;
  itemProps: unknown;
  cardProps: unknown;
  deckProps: unknown;
  individualCardPiles: "draw" | "hand" | "discard";
  sharedCardPiles: string;
}

interface MyEvents {
  playCard: () => void;
  drawCard: () => void;
  endTurn: () => void;
}

// a 1v1 game consisting of draw, discard, health and mana mechanics
import { Runtime } from "./deckforge/Runtime";
import type { Generics } from "./deckforge/state/Generics";
import type { BattleMember } from "./deckforge/state/BattleMember";
import type { CardId } from "./deckforge/state/Card";
import type { PlayerId } from "./deckforge/state/Player";

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
    const { member1 } = runtime.state.currentBattle!.props;

    runtime.events.drawCard(member1.player.id);

    runtime.events.playCard({
      playerId: member1.player.id,
      cardId: member1.cardPiles.hand[0]!.id,
    });

    expect(runtime.state.currentBattle?.winningPlayerId).toBe(
      member1.player.id
    );
  });
});

interface MyRuntimeContext extends Generics {
  events: MyEvents;
  settings: unknown;
  battleProps: {
    member1: BattleMember<MyRuntimeContext>;
    member2: BattleMember<MyRuntimeContext>;
  };
  playerProps: unknown;
  itemProps: unknown;
  cardProps: unknown;
  deckProps: unknown;
  playerCardPiles: "draw" | "hand" | "discard";
  battleCardPiles: string;
}

type MyEvents = {
  playCard: (input: { playerId: PlayerId; cardId: CardId }) => void;
  drawCard: (id: PlayerId) => void;
  endTurn: () => void;
};

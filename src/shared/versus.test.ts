// a 1v1 game consisting of draw, discard, health and mana mechanics
import { Machine } from "./machine/Machine";
import type { BattleMember, CardId, PlayerId } from "./deckforge/Entities";
import type { EventHandlerSelector } from "./machine/Event";

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

    const runtime = new Machine<RC>({});
    const { member1 } = runtime.state;

    runtime.events.drawCard(member1.player.id);

    runtime.events.playCard({
      playerId: member1.player.id,
      cardId: member1.cardPiles.hand[0]!.id,
    });

    expect(runtime.state.winner).toBe(member1.player.id);
  });
});

interface RC {
  events: MyEvents;
  state: MyRuntimeState;
  battleProps: unknown;
  playerProps: unknown;
  itemProps: unknown;
  cardProps: unknown;
  deckProps: unknown;
  playerCardPiles: "draw" | "hand" | "discard";
  battleCardPiles: string;
}

interface MyRuntimeState {
  member1: BattleMember<RC>;
  member2: BattleMember<RC>;
  winner?: PlayerId;
}

type MyEvents = {
  playCard: (input: { playerId: PlayerId; cardId: CardId }) => void;
  drawCard: (id: PlayerId) => void;
  endTurn: () => void;
};

const selectEventHandlers: EventHandlerSelector<RC> = function* (
  { member1, member2 },
  eventName
) {
  for (const player of [member1, member2]) {
    for (const item of player.items) {
      const itemEffects = item.effects[eventName];
      if (itemEffects) {
        for (const effect of itemEffects) {
          yield effect;
        }
      }
    }
    for (const card of player.deck.cards) {
      const cardEffects = card.effects[eventName];
      if (cardEffects) {
        for (const effect of cardEffects) {
          yield effect;
        }
      }
    }
  }
};

import type { Card, Deck, Player } from "./Entities";
import { createRuntime } from "./Runtime";
import { createId } from "./createId";

// a 1v1 game consisting of draw, discard, health and mana mechanics

describe("versus", () => {
  it("can play a game", () => {
    const card: Card = { id: createId(), effects: { playCard: [] } };
    const deck: Deck = { id: createId(), cards: [card.id] };
    const player1: Player = { id: createId(), deck: deck.id, health: 1 };
    const player2: Player = { id: createId(), deck: deck.id, health: 1 };

    const runtime = createRuntime({
      decks: new Map(),
      cards: new Map(),
      battles: new Map(),
      players: new Map(),
    });

    runtime.events.startBattle({
      member1: player1.id,
      member2: player2.id,
    });

    const battleId = Array.from(runtime.state.battles.values())[0]?.id!;

    runtime.events.drawCard({
      playerId: player1.id,
      battleId: battleId,
    });

    let battle = runtime.state.battles.get(battleId)!;
    runtime.events.playCard({
      battleId,
      playerId: player1.id,
      targetId: player2.id,
      cardId: battle.member1.cards.hand[0]!,
    });

    runtime.events.endTurn(battleId);

    battle = runtime.state.battles.get(battleId)!;
    expect(battle?.winner).toBe(player1.id);
  });
});

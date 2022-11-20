import type { Card, Deck, Player } from "./Entities";
import { createRuntime } from "./Runtime";
import { createId } from "./createId";

it("1v1: can play a one card deck and win the game", () => {
  const card = mockCard(1);
  const deck: Deck = { id: createId(), cards: [card.id] };
  const player1: Player = { id: createId(), deck: deck.id, health: 1 };
  const player2: Player = { id: createId(), deck: deck.id, health: 1 };

  const runtime = createRuntime({
    decks: new Map([[deck.id, deck]]),
    cards: new Map([[card.id, card]]),
    battles: new Map(),
    players: new Map([
      [player1.id, player1],
      [player2.id, player2],
    ]),
  });

  const battleId = runtime.actions.startBattle(player1.id, player2.id);
  runtime.actions.drawCard(battleId, player1.id);

  let battle = runtime.state.battles.get(battleId)!;
  runtime.actions.playCard({
    battleId,
    playerId: player1.id,
    targetId: player2.id,
    cardId: battle.member1.cards.hand[0]!,
  });

  runtime.actions.endTurn(battleId);

  battle = runtime.state.battles.get(battleId)!;
  expect(battle?.winner).toBe(player1.id);
});

it("1v1: can play a two card deck and win the game", () => {
  const cards = new Map(
    [mockCard(1), mockCard(-1)].map((card) => [card.id, card])
  );
  const deck: Deck = { id: createId(), cards: Array.from(cards.keys()) };
  const player1: Player = { id: createId(), deck: deck.id, health: 3 };
  const player2: Player = { id: createId(), deck: deck.id, health: 3 };

  const runtime = createRuntime({
    decks: new Map([[deck.id, deck]]),
    cards,
    battles: new Map(),
    players: new Map([
      [player1.id, player1],
      [player2.id, player2],
    ]),
  });

  const battleId = runtime.actions.startBattle(player1.id, player2.id);
  runtime.actions.drawCard(battleId, player1.id);

  let battle = runtime.state.battles.get(battleId)!;
  runtime.actions.playCard({
    battleId,
    playerId: player1.id,
    targetId: player2.id,
    cardId: battle.member1.cards.hand[0]!,
  });

  runtime.actions.endTurn(battleId);

  battle = runtime.state.battles.get(battleId)!;
  expect(battle?.winner).toBe(player1.id);
});

function mockCard(damage: number): Card {
  return {
    id: createId(),
    effects: {
      playCard: [
        (state, _, { targetId }) => {
          const target = state.players.get(targetId);
          if (target) {
            target.health -= 1;
          }
        },
      ],
    },
  };
}

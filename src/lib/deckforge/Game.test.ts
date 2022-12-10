import { RuntimeCard, RuntimeDeck, RuntimePlayer } from "./Entities";
import { createGame } from "./Game";

it("1v1: can play a one card deck and win the game", () => {
  const card = new DamageCard(1);
  const deck = new RuntimeDeck([card.id]);
  const player1 = new RuntimePlayer(deck.id, 1);
  const player2 = new RuntimePlayer(deck.id, 1);

  const game = createGame({
    decks: new Map([[deck.id, deck]]),
    cards: new Map([[card.id, card]]),
    battles: new Map(),
    players: new Map([
      [player1.id, player1],
      [player2.id, player2],
    ]),
  });

  game.execute((state) => {
    const battleId = game.actions.startBattle([player1.id, player2.id]);
    game.actions.drawCard({ battleId, playerId: player1.id });

    const battle = state.battles.get(battleId)!;
    game.actions.playCard({
      battleId,
      playerId: player1.id,
      targetId: player2.id,
      cardId: battle.member1.cards.hand[0]!,
    });

    game.actions.endTurn(battleId);
    expect(battle.winner).toBe(player1.id);
  });
});

it("1v1: can play a two card deck and win the game", () => {
  const cards = new Map(
    [new DamageCard(1), new DamageCard(-1)].map((card) => [card.id, card])
  );
  const deck = new RuntimeDeck(cards.keys());
  const player1 = new RuntimePlayer(deck.id, 1);
  const player2 = new RuntimePlayer(deck.id, 1);

  const game = createGame({
    decks: new Map([[deck.id, deck]]),
    cards,
    battles: new Map(),
    players: new Map([
      [player1.id, player1],
      [player2.id, player2],
    ]),
  });

  game.execute((state) => {
    const battleId = game.actions.startBattle([player1.id, player2.id]);
    const battle = state.battles.get(battleId)!;
    const hand = battle.member1.cards.hand;

    game.actions.drawCard({ battleId, playerId: player1.id });
    game.actions.playCard({
      battleId,
      playerId: player1.id,
      targetId: player2.id,
      cardId: hand[0]!,
    });

    game.actions.endTurn(battleId);
    expect(battle.winner).toBe(player1.id);
  });
});

class DamageCard extends RuntimeCard {
  constructor(public damage: number) {
    super({
      playCard: [
        (state, { input: { targetId, cardId } }) => {
          if (this.id !== cardId) {
            return;
          }
          const target = state.players.get(targetId);
          if (target) {
            target.health -= this.damage;
          }
        },
      ],
    });
  }
}

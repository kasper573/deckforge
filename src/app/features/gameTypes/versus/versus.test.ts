import { testGameType } from "../testUtils";
import { reactVersus } from "./gameType";

describe("versus", () => {
  it("can play through the default game", () =>
    testGameType(reactVersus, (runtime) => {
      runtime.actions.startBattle({
        player1Deck: runtime.state.decks[0].id,
        player2Deck: runtime.state.decks[1].id,
      });

      turn(() => playNthP1Card(0));
      turn();
      turn(() => playNthP1Card(0));
      turn();
      turn(() => playNthP1Card(1));
      turn();
      playNthP1Card(1);

      expect(runtime.state.properties.status).toEqual({
        type: "result",
        winner: runtime.state.players[0].id,
      });

      function playNthP1Card(n: number) {
        const [p1, p2] = runtime.state.players;
        runtime.actions.playCard({
          playerId: p1.id,
          cardId: p1.board.hand[n].id,
          targetId: p2.id,
        });
      }

      function turn(fn?: () => void) {
        fn?.();
        runtime.actions.nextTurn();
      }
    }));
});

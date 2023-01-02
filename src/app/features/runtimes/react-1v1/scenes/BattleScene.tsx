import { adapter } from "../definition";
import { PlayerBoard } from "../PlayerBoard";
import { EndTurnButton } from "../EndTurnButton";

export function BattleScene() {
  const [player1, player2] = adapter.useRuntimeState((state) => state.players);
  const { nextTurn } = adapter.useRuntimeActions();
  return (
    <>
      <PlayerBoard placement="top" player={player2} opponent={player1} />
      <PlayerBoard placement="bottom" player={player1} opponent={player2}>
        <EndTurnButton onClick={nextTurn} />
      </PlayerBoard>
    </>
  );
}

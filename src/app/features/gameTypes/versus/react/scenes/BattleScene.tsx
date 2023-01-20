import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { adapter } from "../../definition";
import { PlayerBoard } from "../PlayerBoard";

export function BattleScene() {
  const [player1, player2] = adapter.useRuntimeState((state) => state.players);
  const { nextTurn } = adapter.useRuntimeActions();
  return (
    <>
      <PlayerBoard placement="top" player={player2} opponent={player1} />
      <PlayerBoard placement="bottom" player={player1} opponent={player2} />
      <EndTurnButton variant="contained" onClick={nextTurn}>
        End Turn
      </EndTurnButton>
    </>
  );
}

const EndTurnButton = styled(Button)`
  position: absolute;
  bottom: 50%;
  right: 16px;
  transform: translateY(50%);
`;

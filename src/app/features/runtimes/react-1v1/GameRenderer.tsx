import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { GameRuntime } from "../../compiler/compileGame";
import { Center } from "../../../components/Center";
import { PlayerBoard } from "./PlayerBoard";
import type { React1v1Generics } from "./definition";
import { adapter } from "./definition";
import { EndTurnButton } from "./EndTurnButton";

export interface GameRendererProps extends ComponentProps<typeof Viewport> {
  runtime: GameRuntime<React1v1Generics>;
}

export function GameRenderer({ runtime, ...viewportProps }: GameRendererProps) {
  useEffect(() => {
    runtime.actions.startBattle();
  }, [runtime]);

  return (
    <adapter.RuntimeProvider value={runtime}>
      <GameViewport {...viewportProps} />
    </adapter.RuntimeProvider>
  );
}

function GameViewport(props: ComponentProps<typeof Viewport>) {
  const [player1, player2] = adapter.useRuntimeState((state) => state.players);
  const status = adapter.useRuntimeState((state) => state.status);
  const { nextTurn, startBattle } = adapter.useRuntimeActions();
  return (
    <Viewport {...props}>
      {status.type === "result" ? (
        <Center>
          <Typography sx={{ textAlign: "center", color: "black" }}>
            {status.winner === player1.id ? "You win!" : "You lost!"}
          </Typography>
          <Button variant="contained" onClick={startBattle} sx={{ mt: 2 }}>
            Play again
          </Button>
        </Center>
      ) : (
        <>
          <PlayerBoard placement="top" player={player2} opponent={player1} />
          <PlayerBoard placement="bottom" player={player1} opponent={player2}>
            <EndTurnButton onClick={nextTurn} />
          </PlayerBoard>
        </>
      )}
    </Viewport>
  );
}

const Viewport = styled("div")`
  background: skyblue;
  position: relative;
  user-select: none;
`;

import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import type { GameRuntime } from "../../compiler/compileGame";
import { PlayerBoard } from "./PlayerBoard";
import type { React1v1Generics } from "./definition";
import { adapter } from "./definition";

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
  return (
    <Viewport {...props}>
      <PlayerBoard placement="bottom" player={player1} opponent={player2} />
      <PlayerBoard placement="top" player={player2} opponent={player1} />
    </Viewport>
  );
}

const Viewport = styled("div")`
  background: skyblue;
  position: relative;
  user-select: none;
`;

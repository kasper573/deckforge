import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import type { Game } from "../../../api/services/game/types";
import { PlayerBoard } from "./PlayerBoard";

export interface GameRuntimeProps extends ComponentProps<typeof Viewport> {
  game: Game;
}

export function GameRuntime({ game, ...viewportProps }: GameRuntimeProps) {
  const runtime = useMemo(() => createRuntime(game), [game]);
  return (
    <Viewport {...viewportProps}>
      <PlayerBoard placement="top" />
      <PlayerBoard placement="bottom" />
    </Viewport>
  );
}

function createRuntime(game: Game) {
  return {};
}

const Viewport = styled("div")`
  background: skyblue;
  position: relative;
`;

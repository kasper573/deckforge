import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import type { Game } from "../../../api/services/game/types";

export interface GameRuntimeProps extends ComponentProps<typeof Viewport> {
  game: Game;
}

export function GameRuntime({ game, ...viewportProps }: GameRuntimeProps) {
  return <Viewport {...viewportProps} />;
}

const Viewport = styled("div")`
  background: skyblue;
`;

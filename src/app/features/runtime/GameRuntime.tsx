import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import type { Game } from "../../../api/services/game/types";
import { PlayerBoard } from "./PlayerBoard";
import { createRuntime } from "./createRuntime";
import { createReactRuntimeAdapter } from "./ReactRuntimeAdapter";

export interface GameRuntimeProps extends ComponentProps<typeof Viewport> {
  game: Game;
}

export function GameRuntime({ game, ...viewportProps }: GameRuntimeProps) {
  const runtime = useMemo(() => createRuntime(game), [game]);
  const adapter = useMemo(() => createReactRuntimeAdapter(runtime), [runtime]);

  return (
    <adapter.Provider>
      <Viewport {...viewportProps}>
        <PlayerBoard placement="bottom" />
        <PlayerBoard placement="top" />
      </Viewport>
    </adapter.Provider>
  );
}

const Viewport = styled("div")`
  background: skyblue;
  position: relative;
`;

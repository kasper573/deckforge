import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import type { GameRuntime } from "../../compiler/compileGame";
import type { React1v1Generics } from "./definition";
import { adapter } from "./definition";
import { Scenes } from "./scenes";

export interface GameRendererProps extends ComponentProps<typeof Viewport> {
  runtime: GameRuntime<React1v1Generics>;
}

export function GameRenderer({ runtime, ...viewportProps }: GameRendererProps) {
  return (
    <adapter.RuntimeProvider value={runtime}>
      <Viewport {...viewportProps}>
        <Scenes />
      </Viewport>
    </adapter.RuntimeProvider>
  );
}

const Viewport = styled("div")`
  position: relative;
  user-select: none;
  flex: 1;
`;

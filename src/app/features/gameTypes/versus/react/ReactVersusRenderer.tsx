import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import type { GameRuntime } from "../../../compiler/compileGame";
import type { VersusGenerics } from "../runtimeDefinition";
import { adapter } from "../runtimeDefinition";
import { Scenes } from "./scenes";

export interface GameRendererProps extends ComponentProps<typeof Viewport> {
  runtime: GameRuntime<VersusGenerics>;
}

export function ReactVersusRenderer({
  runtime,
  ...viewportProps
}: GameRendererProps) {
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

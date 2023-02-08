import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import type { GameRuntime } from "../../compiler/types";
import type { VersusGenerics } from "./runtimeDefinition";
import { adapter } from "./runtimeDefinition";
import { Scenes } from "./scenes";

export interface RendererProps extends ComponentProps<typeof Viewport> {
  runtime: GameRuntime<VersusGenerics>;
}

export default function Renderer({ runtime, ...viewportProps }: RendererProps) {
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

import type { ComponentProps } from "react";
import type { RuntimeGenerics } from "../compiler/types";
import type { GameTypeId } from "../../../api/services/game/types";
import type { GameRendererProps } from "./GameType";
import { gameTypes } from "./index";

export function LazyGameRenderer<G extends RuntimeGenerics>({
  type,
  ...rendererProps
}: GameRendererProps<G> & { type: GameTypeId }) {
  const { renderer: Renderer } = gameTypes[type];
  return <Renderer {...(rendererProps as ComponentProps<typeof Renderer>)} />;
}

import type { ComponentProps } from "react";
import type { GameTypeId } from "../../../api/services/game/types";
import type { GameRendererProps } from "../gameTypes/GameType";
import { gameTypes } from "../gameTypes";
import type { RuntimeGenerics } from "./types";

export function GameRenderer<G extends RuntimeGenerics>({
  type,
  ...rendererProps
}: GameRendererProps<G> & { type: GameTypeId }) {
  const { renderer: Renderer } = gameTypes[type];

  return <Renderer {...(rendererProps as ComponentProps<typeof Renderer>)} />;
}

import type { ComponentProps, ReactNode } from "react";
import { Suspense } from "react";
import type { GameTypeId } from "../../../api/services/game/types";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { Center } from "../../components/Center";
import type { GameRendererProps } from "../gameTypes/GameType";
import { gameTypes } from "../gameTypes";
import type { RuntimeGenerics } from "./types";

export function GameRenderer<G extends RuntimeGenerics>({
  type,
  loader = (
    <Center>
      <LoadingIndicator />
    </Center>
  ),
  ...rendererProps
}: GameRendererProps<G> & { type: GameTypeId; loader?: ReactNode }) {
  const { renderer: Renderer } = gameTypes[type];

  return (
    <Suspense fallback={loader}>
      <Renderer {...(rendererProps as ComponentProps<typeof Renderer>)} />
    </Suspense>
  );
}

import type { ComponentProps, ReactNode } from "react";
import { Suspense } from "react";
import type { RuntimeGenerics } from "../compiler/types";
import type { GameTypeId } from "../../../api/services/game/types";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { Center } from "../../components/Center";
import type { GameRendererProps } from "./GameType";
import { gameTypes } from "./index";

export function LazyGameRenderer<G extends RuntimeGenerics>({
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

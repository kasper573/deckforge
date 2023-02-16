import type { ComponentProps } from "react";
import Typography from "@mui/material/Typography";
import type { Result } from "neverthrow";
import { Suspense } from "react";
import type { GameTypeId } from "../../../api/services/game/types";
import type { GameRendererProps } from "../gameTypes/GameType";
import { gameTypes } from "../gameTypes";
import { Center } from "../../components/Center";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import type { RuntimeGenerics } from "./types";
import type { GameRuntime } from "./types";

export function GameRenderer<G extends RuntimeGenerics>({
  type,
  ...rendererProps
}: GameRendererProps<G> & { type?: GameTypeId }) {
  const gameType = type ? gameTypes.get(type) : undefined;
  if (!gameType) {
    return (
      <Center>
        <Typography color="error">Unknown game type: {type}</Typography>
      </Center>
    );
  }

  const { renderer: Renderer } = gameType;
  return <Renderer {...(rendererProps as ComponentProps<typeof Renderer>)} />;
}

export type PendingGameRuntime<G extends RuntimeGenerics> =
  | { status: "ready"; runtime: GameRuntime<G> }
  | { status: "pending" };

export function PendingGameRenderer<G extends RuntimeGenerics>({
  result,
  ...gameRendererProps
}: Omit<ComponentProps<typeof GameRenderer<G>>, "runtime"> & {
  result: Result<PendingGameRuntime<G>, unknown[]>;
}) {
  if (result.isErr()) {
    throw new Error(result.error.join(", "));
  }

  const fallback = (
    <Center>
      <LoadingIndicator />
    </Center>
  );

  return (
    <Suspense fallback={fallback}>
      {result.value.status === "pending" ? (
        fallback
      ) : (
        <GameRenderer runtime={result.value.runtime} {...gameRendererProps} />
      )}
    </Suspense>
  );
}

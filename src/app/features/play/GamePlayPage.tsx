import { useRouteParams } from "react-typesafe-routes";
import { useMemo } from "react";
import { Page } from "../layout/Page";
import { router } from "../../router";
import { ReactVersusRenderer } from "../gameTypes/versus/react/ReactVersusRenderer";
import { compileGame } from "../compiler/compileGame";
import type { RuntimeGenerics } from "../compiler/types";
import { deriveRuntimeDefinition } from "../compiler/defineRuntime";
import { trpc } from "../../trpc";

export default function GamePlayPage() {
  const { gameId } = useRouteParams(router.play().game);
  const { data: game } = trpc.game.read.useQuery(gameId);

  const compiled = useMemo(() => {
    if (game) {
      return compileGame<RuntimeGenerics>(
        deriveRuntimeDefinition(game.definition),
        game.definition
      );
    }
  }, [game]);

  if (!compiled || compiled?.error || !compiled.runtime) {
    throw compiled?.error ?? new Error("Could not compile game");
  }

  return (
    <Page>
      <ReactVersusRenderer runtime={compiled.runtime} />
    </Page>
  );
}

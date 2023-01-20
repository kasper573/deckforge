import { useRouteParams } from "react-typesafe-routes";
import { useMemo } from "react";
import { Page } from "../layout/Page";
import { router } from "../../router";
import { compileGame } from "../compiler/compileGame";
import type { RuntimeGenerics } from "../compiler/types";
import { deriveRuntimeDefinition } from "../compiler/defineRuntime";
import { trpc } from "../../trpc";
import { LazyGameRenderer } from "../gameTypes/LazyGameRenderer";

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
      {game && (
        <LazyGameRenderer
          type={game.type}
          runtime={compiled.runtime}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </Page>
  );
}

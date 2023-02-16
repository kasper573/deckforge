import { useRouteParams } from "react-typesafe-routes";
import { useMemo } from "react";
import { Page } from "../layout/Page";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { PendingGameRenderer } from "../compiler/GameRenderer";
import { useGameCompiler } from "../compiler/useGameCompiler";
import { gameTypes } from "../gameTypes";
import { deriveRuntimeDefinition } from "../compiler/defineRuntime";

export default function GamePlayPage() {
  const { slug } = useRouteParams(router.play);
  const { data: game } = trpc.game.read.useQuery({ type: "slug", slug });

  const runtimeDefinition = useMemo(() => {
    if (game) {
      const baseDefinition = gameTypes.get(game.type)?.runtimeDefinition;
      return deriveRuntimeDefinition(game.definition, baseDefinition);
    }
  }, [game]);

  const result = useGameCompiler(runtimeDefinition, game?.definition);

  return (
    <Page>
      {game && (
        <PendingGameRenderer
          type={game.type}
          result={result}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </Page>
  );
}

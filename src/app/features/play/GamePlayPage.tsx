import { useRouteParams } from "react-typesafe-routes";
import { useMemo } from "react";
import { Page } from "../layout/Page";
import { router } from "../../router";
import { trpc } from "../../trpc";
import { GameRenderer } from "../compiler/GameRenderer";
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

  const compiled = useGameCompiler(runtimeDefinition, game?.definition);

  if (!compiled || compiled?.errors || !compiled.runtime) {
    throw new Error(
      compiled?.errors ? compiled.errors.join(", ") : "Could not compile game"
    );
  }

  return (
    <Page>
      {game && (
        <GameRenderer
          type={game.type}
          runtime={compiled.runtime}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </Page>
  );
}

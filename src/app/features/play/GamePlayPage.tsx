import { useRouteParams } from "react-typesafe-routes";
import { useMemo } from "react";
import { Page } from "../layout/Page";
import { router } from "../../router";
import { compileGame } from "../compiler/compileGame";
import { deriveRuntimeDefinition } from "../compiler/defineRuntime";
import { trpc } from "../../trpc";
import { GameRenderer } from "../compiler/GameRenderer";
import { gameTypes } from "../gameTypes";
import { useDisposable } from "../../hooks/useDisposable";
import { useAsyncMemo } from "../../hooks/useAsyncMemo";
import { moduleCompiler } from "../compiler/moduleRuntimes";

export default function GamePlayPage() {
  const { slug } = useRouteParams(router.play);
  const { data: game } = trpc.game.read.useQuery({ type: "slug", slug });

  const createModuleCompiler = useAsyncMemo(moduleCompiler.loadCompilerFactory);
  const compiled = useMemo(() => {
    if (game && createModuleCompiler) {
      const baseDefinition = gameTypes.get(game.type)?.runtimeDefinition;
      if (baseDefinition) {
        return compileGame(
          deriveRuntimeDefinition(game.definition, baseDefinition),
          game.definition,
          { moduleCompiler: createModuleCompiler() }
        );
      }
    }
  }, [game, createModuleCompiler]);
  useDisposable(compiled);

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

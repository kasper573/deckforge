import { useRouteParams } from "react-typesafe-routes";
import { useMemo } from "react";
import { Page } from "../layout/Page";
import { router } from "../../router";
import { compileGame } from "../compiler/compileGame";
import { deriveRuntimeDefinition } from "../compiler/defineRuntime";
import { trpc } from "../../trpc";
import { GameRenderer } from "../compiler/GameRenderer";
import { gameTypes } from "../gameTypes";

export default function GamePlayPage() {
  const { slug } = useRouteParams(router.play);
  const { data: game } = trpc.game.read.useQuery({ type: "slug", slug });

  const compiled = useMemo(() => {
    if (game) {
      const baseDefinition = gameTypes.get(game.type)?.runtimeDefinition;
      if (baseDefinition) {
        return compileGame(
          deriveRuntimeDefinition(game.definition, baseDefinition),
          game.definition
        );
      }
    }
  }, [game]);

  if (!compiled || compiled?.error || !compiled.runtime) {
    throw compiled?.error ?? new Error("Could not compile game");
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

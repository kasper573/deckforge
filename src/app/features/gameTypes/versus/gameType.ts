import { lazy } from "react";
import type { GameTypeId } from "../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../api/services/game/types";
import type { GameType } from "../GameType";
import type { VersusGenerics } from "./runtimeDefinition";
import { runtimeDefinition } from "./runtimeDefinition";

export const reactVersus: GameType<VersusGenerics> = {
  id: "react-versus" as GameTypeId,
  name: "1 vs 1",
  description: "1v1 turn based and mana/health based combat.",
  runtimeDefinition,
  renderer: lazy(() => import("./Renderer")),
  defaultGameDefinition: () =>
    import("./defaultGameDefinition.json").then((m) =>
      gameDefinitionType.parse(m.default)
    ),
};

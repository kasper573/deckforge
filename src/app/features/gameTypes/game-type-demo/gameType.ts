import { lazy } from "react";
import type { GameTypeId } from "../../../../api/services/game/types";
import type { GameType } from "../GameType";
import { gameDefinitionType } from "../../../../api/services/game/types";
import type { DemoGenerics } from "./runtimeDefinition";
import { runtimeDefinition } from "./runtimeDefinition";

export const gameTypeDemo: GameType<DemoGenerics> = {
  id: "game-type-demo" as GameTypeId,
  name: "Empty game",
  description:
    "An empty game. Pointless except as proof of concept that deck forge supports multiple game types.",
  runtimeDefinition,
  renderer: lazy(() => import("./Renderer")),
  defaultGameDefinition: () =>
    import("./defaultGameDefinition.json").then((m) =>
      gameDefinitionType.parse(m.default)
    ),
};

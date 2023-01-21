import { lazy } from "react";
import type { GameTypeId } from "../../../../api/services/game/types";
import type { GameType } from "../GameType";
import { gameDefinitionType } from "../../../../api/services/game/types";
import defaultGameDefinitionJson from "./defaultGameDefinition.json";
import type { DemoGenerics } from "./runtimeDefinition";
import { runtimeDefinition } from "./runtimeDefinition";

export const gameTypeDemo: GameType<DemoGenerics> = {
  id: "game-type-demo" as GameTypeId,
  name: "Different game type demonstration",
  renderer: lazy(() => import("./Renderer")),
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition,
};

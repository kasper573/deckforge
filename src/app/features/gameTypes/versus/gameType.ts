import { lazy } from "react";
import type { GameTypeId } from "../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../api/services/game/types";
import type { GameType } from "../GameType";
import type { VersusGenerics } from "./runtimeDefinition";
import defaultGameDefinitionJson from "./defaultGameDefinition.json";
import { versusDefinition } from "./runtimeDefinition";

export const reactVersus: GameType<VersusGenerics> = {
  id: "react-versus" as GameTypeId,
  name: "1 vs 1",
  renderer: lazy(() => import("./components/ReactVersusRenderer")),
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: versusDefinition,
};

import { lazy } from "react";
import type { VersusGenerics } from "../runtimeDefinition";
import type { GameTypeId } from "../../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import type { GameType } from "../../GameType";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";
import { versusDefinition } from "../runtimeDefinition";

export const reactVersus: GameType<VersusGenerics> = {
  id: "react-versus" as GameTypeId,
  name: "React Versus",
  renderer: lazy(() => import("./ReactVersusRenderer")),
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: versusDefinition,
};

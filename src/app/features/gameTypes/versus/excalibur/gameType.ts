import { lazy } from "react";
import type { GameTypeId } from "../../../../../api/services/game/types";
import type { VersusGenerics } from "../runtimeDefinition";
import type { GameType } from "../../GameType";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";
import { versusDefinition } from "../runtimeDefinition";

export const excaliburVersus: GameType<VersusGenerics> = {
  id: "excalibur-versus" as GameTypeId,
  name: "Excalibur Versus",
  renderer: lazy(() => import("./ExcaliburVersusRenderer")),
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: versusDefinition,
};

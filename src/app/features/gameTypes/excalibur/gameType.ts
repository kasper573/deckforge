import { lazy } from "react";
import type { GameTypeId } from "../../../../api/services/game/types";
import type { VersusGenerics } from "../versus/runtimeDefinition";
import type { GameType } from "../GameType";
import { gameDefinitionType } from "../../../../api/services/game/types";
import defaultGameDefinitionJson from "../versus/defaultGameDefinition.json";
import { versusDefinition } from "../versus/runtimeDefinition";

export const excaliburVersus: GameType<VersusGenerics> = {
  id: "game-type-demo" as GameTypeId,
  name: "Different game type demonstration",
  renderer: lazy(() => import("./ExcaliburVersusRenderer")),
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: versusDefinition,
};

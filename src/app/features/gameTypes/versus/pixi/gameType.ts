import { lazy } from "react";
import type { GameTypeId } from "../../../../../api/services/game/types";
import type { VersusGenerics } from "../runtimeDefinition";
import type { GameType } from "../../GameType";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";
import { versusDefinition } from "../runtimeDefinition";

export const pixiVersus: GameType<VersusGenerics> = {
  id: "pixi-versus" as GameTypeId,
  name: "Pixi Versus",
  renderer: lazy(() => import("./PixiVersusRenderer")),
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: versusDefinition,
};

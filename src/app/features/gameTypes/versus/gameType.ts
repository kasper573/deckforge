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
  description: "1v1 turn based and mana/health based combat.",
  renderer: lazy(() => import("./Renderer")),
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: versusDefinition,
};

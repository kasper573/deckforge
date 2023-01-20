import type { GameTypeId } from "../../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";
import { reactVersusDefinition } from "../runtimeDefinition";
import type { GameType } from "../../GameType";

export const pixiVersus: GameType = {
  id: "pixi-versus" as GameTypeId,
  name: "Pixi Versus",
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: reactVersusDefinition,
};

import type {
  GameType,
  GameTypeId,
} from "../../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";
import { reactVersusDefinition } from "../runtimeDefinition";

export const pixiVersus: GameType = {
  id: "pixi-versus" as GameTypeId,
  name: "Pixi Versus",
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: reactVersusDefinition,
};

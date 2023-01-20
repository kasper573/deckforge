import type {
  GameType,
  GameTypeId,
} from "../../../../../api/services/game/types";
import { reactVersusDefinition } from "../runtimeDefinition";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";

export const reactVersus: GameType = {
  id: "react-versus" as GameTypeId,
  name: "React Versus",
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: reactVersusDefinition,
};

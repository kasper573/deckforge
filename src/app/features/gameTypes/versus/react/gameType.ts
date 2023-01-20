import type { GameTypeId } from "../../../../../api/services/game/types";
import type { VersusGenerics } from "../runtimeDefinition";
import { reactVersusDefinition } from "../runtimeDefinition";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";
import type { GameType } from "../../GameType";
import { ReactVersusRenderer } from "./ReactVersusRenderer";

export const reactVersus: GameType<VersusGenerics> = {
  id: "react-versus" as GameTypeId,
  name: "React Versus",
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: reactVersusDefinition,
  renderer: ReactVersusRenderer,
};

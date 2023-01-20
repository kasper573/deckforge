import type { GameTypeId } from "../../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import defaultGameDefinitionJson from "../defaultGameDefinition.json";
import type { VersusGenerics } from "../runtimeDefinition";
import { reactVersusDefinition } from "../runtimeDefinition";
import type { GameType } from "../../GameType";
import { PixiGameRenderer } from "./PixiVersusRenderer";

export const pixiVersus: GameType<VersusGenerics> = {
  id: "pixi-versus" as GameTypeId,
  name: "Pixi Versus",
  defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinitionJson),
  runtimeDefinition: reactVersusDefinition,
  renderer: PixiGameRenderer,
};

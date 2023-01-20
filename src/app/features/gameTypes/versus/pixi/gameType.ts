import type { GameTypeId } from "../../../../../api/services/game/types";
import type { VersusGenerics } from "../runtimeDefinition";
import type { GameType } from "../../GameType";
import { gameDefinitionType } from "../../../../../api/services/game/types";

export const pixiVersus: GameType<VersusGenerics> = {
  id: "pixi-versus" as GameTypeId,
  name: "Pixi Versus",
  async load() {
    const [
      { default: defaultGameDefinition },
      { reactVersusDefinition: runtimeDefinition },
      { PixiGameRenderer: renderer },
    ] = await Promise.all([
      import("../defaultGameDefinition.json"),
      import("../runtimeDefinition"),
      import("./PixiVersusRenderer"),
    ]);
    return {
      defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinition),
      runtimeDefinition,
      renderer,
    };
  },
};

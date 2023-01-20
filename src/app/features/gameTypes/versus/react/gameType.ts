import type { VersusGenerics } from "../runtimeDefinition";
import type { GameTypeId } from "../../../../../api/services/game/types";
import { gameDefinitionType } from "../../../../../api/services/game/types";
import type { GameType } from "../../GameType";

export const reactVersus: GameType<VersusGenerics> = {
  id: "react-versus" as GameTypeId,
  name: "React Versus",
  async load() {
    const [
      { default: defaultGameDefinition },
      { reactVersusDefinition: runtimeDefinition },
      { ReactVersusRenderer: renderer },
    ] = await Promise.all([
      import("../defaultGameDefinition.json"),
      import("../runtimeDefinition"),
      import("./ReactVersusRenderer"),
    ]);
    return {
      defaultGameDefinition: gameDefinitionType.parse(defaultGameDefinition),
      runtimeDefinition,
      renderer,
    };
  },
};

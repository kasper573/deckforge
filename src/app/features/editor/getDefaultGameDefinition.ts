import { gameDefinitionType } from "../../../api/services/game/types";

export async function getDefaultGameDefinition() {
  return gameDefinitionType.parse(
    await import("../runtimes/versus/defaultGameDefinition.json").then(
      (m) => m.default
    )
  );
}

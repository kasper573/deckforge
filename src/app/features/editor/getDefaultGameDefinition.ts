import { gameDefinitionType } from "../../../api/services/game/types";

export async function getDefaultGameDefinition() {
  return gameDefinitionType.parse(
    await import("../runtimes/1v1/defaultGameDefinition.json").then(
      (m) => m.default
    )
  );
}

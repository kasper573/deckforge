import { gameDefinitionType } from "../../../api/services/game/types";

export async function getDefaultGameDefinition() {
  return gameDefinitionType.parse(
    await import("../runtimes/react-1v1/default-react-1v1.json").then(
      (m) => m.default
    )
  );
}

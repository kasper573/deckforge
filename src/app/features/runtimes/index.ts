import { gameDefinitionType } from "../../../api/services/game/types";

export type RuntimeName = typeof availableRuntimes[number];

export const availableRuntimes = ["versus"] as const;

export async function loadDefaultGameDefinition(name: RuntimeName) {
  return loaders[name]().then(gameDefinitionType.parse);
}

const loaders: Record<RuntimeName, () => Promise<unknown>> = {
  versus: () =>
    import("./versus/defaultGameDefinition.json").then((m) => m.default),
};

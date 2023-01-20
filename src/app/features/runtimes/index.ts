import { gameDefinitionType } from "../../../api/services/game/types";

export async function loadDefaultGameDefinition(name: RuntimeName) {
  return defaultGameDefinitionLoaders[name]().then(gameDefinitionType.parse);
}

const defaultGameDefinitionLoaders = {
  versus: () =>
    import("./versus/defaultGameDefinition.json").then((m) => m.default),
  foo: () =>
    import("./versus/defaultGameDefinition.json").then((m) => m.default),
};

export const availableRuntimes = Object.keys(
  defaultGameDefinitionLoaders
) as RuntimeName[];

export type RuntimeName = keyof typeof defaultGameDefinitionLoaders;

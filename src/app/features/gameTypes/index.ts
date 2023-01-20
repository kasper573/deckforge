import { gameDefinitionType } from "../../../api/services/game/types";

const gameTypes = {
  versus: () =>
    import("./versus/defaultGameDefinition.json").then((m) => m.default),
  foo: () =>
    import("./versus/defaultGameDefinition.json").then((m) => m.default),
};

export const gameTypeNames = Object.keys(gameTypes) as GameTypeName[];

export type GameTypeName = keyof typeof gameTypes;

export async function loadDefaultGameDefinition(name: GameTypeName) {
  return gameTypes[name]().then(gameDefinitionType.parse);
}

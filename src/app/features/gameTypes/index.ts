import { gameDefinitionType } from "../../../api/services/game/types";

const gameTypes = {
  versus: () =>
    import("./versus/defaultGameDefinition.json").then((m) => m.default),
  foo: () =>
    import("./versus/defaultGameDefinition.json").then((m) => m.default),
};

export const gameTypeNames = ["versus", "foo"] as const;

export type GameTypeName = typeof gameTypeNames[number];

export async function loadDefaultGameDefinition(name: GameTypeName) {
  return gameTypes[name]().then(gameDefinitionType.parse);
}

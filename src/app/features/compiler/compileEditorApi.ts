import type { Game } from "../../../api/services/game/types";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import type { Property } from "../../../api/services/game/types";

export interface EditorApi {
  card: CodeEditorTypeDefs;
  action: CodeEditorTypeDefs;
  reaction: CodeEditorTypeDefs;
}

export function compileEditorApi(game: Game): EditorApi {
  const { cards, actions, reactions, properties } = game.definition;
  const playerProperties = properties.filter((p) => p.entityId === "player");
  const cardProperties = properties.filter((p) => p.entityId === "card");
  const common: CodeEditorTypeDefs = `
${defineInterface("Player", playerProperties)}
${defineInterface("Card", cardProperties)}
`;
  return {
    card: common,
    action: common,
    reaction: common,
  };
}

function defineInterface(
  interfaceName: string,
  properties: Property[]
): string {
  return `interface ${interfaceName} {\n${properties
    .map(defineProperty)
    .join(";\n")}\n}`;
}

function defineProperty(property: Property): string {
  return `\t${property.name}: ${property.type}`;
}

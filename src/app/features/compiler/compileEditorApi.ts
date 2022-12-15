import type { Game } from "../../../api/services/game/types";
import type { CodeEditorExtraLib } from "../../components/CodeEditor";
import type { Property } from "../../../api/services/game/types";

export interface EditorApi {
  card: CodeEditorExtraLib[];
  action: CodeEditorExtraLib[];
  reaction: CodeEditorExtraLib[];
}

export function compileEditorApi(game: Game): EditorApi {
  const { cards, actions, reactions, properties } = game.definition;
  const playerProperties = properties.filter((p) => p.entityId === "player");
  const cardProperties = properties.filter((p) => p.entityId === "card");
  const common: CodeEditorExtraLib[] = [
    { name: "player", code: defineInterface("Player", playerProperties) },
    { name: "card", code: defineInterface("Card", cardProperties) },
  ];
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
  return `interface ${interfaceName} { ${properties
    .map(defineProperty)
    .join(";")} }`;
}

function defineProperty(property: Property): string {
  return `${property.name}: ${property.type}`;
}

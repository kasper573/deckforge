import { memoize } from "lodash";
import type { Game, PropertyValueType } from "../../../api/services/game/types";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import type { Property } from "../../../api/services/game/types";

export interface EditorApi {
  card: EditorObjectApi;
  event: EditorObjectApi;
}

export interface EditorObjectApi {
  factoryVariableName: string;
  typeDefs: CodeEditorTypeDefs;
}

export function compileEditorApi(game: Game): EditorApi {
  const { properties } = game.definition;
  const playerProperties = properties.filter((p) => p.entityId === "player");
  const cardProperties = properties.filter((p) => p.entityId === "card");
  const common: CodeEditorTypeDefs = add(
    defineInterface("Player", playerProperties),
    defineInterface("Card", cardProperties),
    defineInterface("Effects", [])
  );
  return {
    card: {
      factoryVariableName: "card",
      typeDefs: add(
        common,
        defineGlobalVariable({
          name: "card",
          type: defineFactoryType({
            inputType: "Card",
            outputType: "Events",
          }),
        })
      ),
    },
    event: {
      factoryVariableName: "event",
      typeDefs: add(
        common,
        defineGlobalVariable({ name: "event", type: "Effects" })
      ),
    },
  };
}

function defineFactoryType(p: { inputType: string; outputType: string }) {
  return `(definition: ${p.inputType}) => ${p.outputType}`;
}

function defineGlobalVariable(p: { name: string; type: string }): string {
  return `declare let ${p.name}: ${p.type};`;
}

function defineInterface(interfaceName: string, properties: Property[]) {
  return `interface ${interfaceName} ${defineObjectType(properties)}`;
}

function defineType(type: PropertyValueType, indentation?: number): string {
  if (typeof type === "string") {
    return type;
  }
  const properties = Object.keys(type).map((name) => ({
    name,
    type: type[name],
  }));
  return defineObjectType(properties, indentation);
}

function defineObjectType(
  properties: Pick<Property, "name" | "type">[],
  indentation = 1
) {
  const propertyStrings = properties.map(
    ({ name, type }) =>
      `${indent(indentation)}${name}: ${defineType(type, indentation + 1)}`,
    "{\n"
  );
  return `{\n${propertyStrings.join(";\n")}\n${indent(indentation - 1)}}`;
}

const indent = memoize((indentation: number) => "\t".repeat(indentation));

function add(...args: CodeEditorTypeDefs[]): CodeEditorTypeDefs {
  return args.join("\n");
}

import { memoize } from "lodash";
import type { Game } from "../../../api/services/game/types";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import type { Event } from "../../../api/services/game/types";

export interface EditorApi {
  card: EditorObjectApi;
  event: EditorObjectApi;
}

export interface EditorObjectApi {
  factoryVariableName: string;
  typeDefs: CodeEditorTypeDefs;
}

export function compileEditorApi(game: Game): EditorApi {
  const { events, properties } = game.definition;
  const playerProperties = properties.filter((p) => p.entityId === "player");
  const cardProperties = properties.filter((p) => p.entityId === "card");
  const common: CodeEditorTypeDefs = add(
    defineInterface("Player", playerProperties),
    defineInterface("Card", cardProperties),
    defineInterface(
      "Effects",
      eventsToEffectMembers({ stateTypeName: "State", events })
    ),
    defineInterface("State", [])
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

function eventsToEffectMembers({
  stateTypeName,
  events,
}: {
  stateTypeName: string;
  events: Event[];
}): Member[] {
  return events.map(({ name, inputType }) => ({
    name,
    type: defineEffectFunction({ stateTypeName, inputType }),
  }));
}

function defineEffectFunction(p: { stateTypeName: string; inputType: Type }) {
  return `(state: ${p.stateTypeName}, input: ${defineType(
    p.inputType,
    2
  )}) => void`;
}

function defineFactoryType(p: { inputType: string; outputType: string }) {
  return `(definition: ${p.inputType}) => ${p.outputType}`;
}

function defineGlobalVariable(p: { name: string; type: string }): string {
  return `declare let ${p.name}: ${p.type};`;
}

function defineInterface(interfaceName: string, members: Member[]) {
  return `interface ${interfaceName} ${defineObjectType(members)}`;
}

function defineType(type: Type, indentation?: number): string {
  if (typeof type === "string") {
    return type;
  }
  const properties = Object.keys(type).map((name) => ({
    name,
    type: type[name],
  }));
  return defineObjectType(properties, indentation);
}

function defineObjectType(members: Member[], indentation = 1) {
  const propertyStrings = members.map(
    ({ name, type }) =>
      `${indent(indentation)}${name}: ${defineType(type, indentation + 1)}`,
    "{\n"
  );
  return `{\n${propertyStrings.join(";\n")}\n${indent(indentation - 1)}}`;
}

type Type = string | { [name: string]: Type };
type Member = { name: string; type: Type };

const indent = memoize((indentation: number) => "\t".repeat(indentation));

function add(...args: CodeEditorTypeDefs[]): CodeEditorTypeDefs {
  return args.join("\n");
}

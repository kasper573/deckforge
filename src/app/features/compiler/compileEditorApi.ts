import { memoize } from "lodash";
import type { Game } from "../../../api/services/game/types";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import type { Event } from "../../../api/services/game/types";
import { zodToTS } from "../../../lib/zod-extensions/zodToTS";
import { gameStateType } from "../runtime/Runtime";

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
    declareInterface(TypeName.Player, playerProperties),
    declareInterface(TypeName.Card, cardProperties),
    declareInterface(TypeName.Effects, eventsToEffectMembers(events)),
    declareInterface(TypeName.Actions, eventsToActionMembers(events)),
    declareType(TypeName.State, zodToTS(gameStateType))
  );
  return {
    card: {
      factoryVariableName: "card",
      typeDefs: add(
        common,
        declareGlobalVariable({
          name: "card",
          type: defineFactoryType({
            inputType: TypeName.Card,
            outputType: TypeName.Effects,
          }),
        })
      ),
    },
    event: {
      factoryVariableName: "event",
      typeDefs: add(
        common,
        declareGlobalVariable({ name: "event", type: TypeName.Effects })
      ),
    },
  };
}

enum TypeName {
  Player = "Player",
  Card = "Card",
  Effects = "Effects",
  Actions = "Actions",
  State = "State",
}

function eventsToEffectMembers(events: Event[]): Member[] {
  return events.map(({ name, inputType }) => ({
    name,
    type: `(state: ${TypeName.State}, input: ${defineType(
      inputType,
      2
    )}) => void`,
  }));
}

function eventsToActionMembers(events: Event[]): Member[] {
  return events.map(({ name, inputType }) => ({
    name,
    type: `(input: ${defineType(inputType, 2)}) => void`,
  }));
}

function defineFactoryType(p: { inputType: string; outputType: string }) {
  return `(definition: ${p.inputType}) => ${p.outputType}`;
}

function declareGlobalVariable(p: { name: string; type: string }): string {
  return `declare let ${p.name}: ${p.type};`;
}

function declareInterface(interfaceName: string, members: Member[]) {
  return `interface ${interfaceName} ${defineObjectType(members)}`;
}

function declareType(typeName: string, type: Type): string {
  return `type ${typeName} = ${defineType(type)};`;
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

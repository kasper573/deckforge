import { memoize } from "lodash";
import type { ZodType } from "zod";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import { zodToTS } from "../../../lib/zod-extensions/zodToTS";
import type { RuntimeDefinition } from "./types";

export interface EditorApi {
  card: EditorObjectApi;
  event: EditorObjectApi;
}

export interface EditorObjectApi {
  factoryVariableName: string;
  typeDefs: CodeEditorTypeDefs;
}

export function compileEditorApi(definition: RuntimeDefinition): EditorApi {
  const lazyResolvers = new Map([[definition.lazyState, TypeName.State]]);

  const common: CodeEditorTypeDefs = add(
    declareType(
      TypeName.Player,
      zodToTS(definition.player, {
        lazyResolvers,
        resolvers: new Map<ZodType, string>([[definition.card, TypeName.Card]]),
      })
    ),
    declareType(TypeName.Card, zodToTS(definition.card, { lazyResolvers })),
    declareType(
      TypeName.State,
      zodToTS(definition.state, {
        lazyResolvers,
        resolvers: new Map<ZodType, string>([
          [definition.player, TypeName.Player],
          [definition.card, TypeName.Card],
        ]),
      })
    )
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
            outputType: TypeName.Events,
          }),
        })
      ),
    },
    event: {
      factoryVariableName: "event",
      typeDefs: add(
        common,
        declareGlobalVariable({ name: "event", type: TypeName.Events })
      ),
    },
  };
}

enum TypeName {
  Player = "Player",
  Card = "Card",
  Events = "Events",
  Actions = "Actions",
  State = "State",
}

function defineFactoryType(p: { inputType: string; outputType: string }) {
  return `(definition: ${p.inputType}) => ${p.outputType}`;
}

function declareGlobalVariable(p: { name: string; type: string }): string {
  return `declare let ${p.name}: ${p.type};`;
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

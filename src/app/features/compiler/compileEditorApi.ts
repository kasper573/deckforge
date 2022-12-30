import { memoize } from "lodash";
import { z } from "zod";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import { zodToTSResolver } from "../../../lib/zod-extensions/zodToTS";
import type { RuntimeDefinition, RuntimeGenerics } from "./types";
import type { RuntimeCard } from "./types";
import { scriptAPIProperties } from "./compileGame";

export interface EditorApi<G extends RuntimeGenerics> {
  card: CodeEditorTypeDefs;
  events: {
    [K in keyof G["actions"]]: CodeEditorTypeDefs;
  };
}

export function compileEditorApi<G extends RuntimeGenerics>(
  definition: RuntimeDefinition<G>
): EditorApi<G> {
  const zodToTS = zodToTSResolver({
    [TypeName.Card]: definition.card,
    [TypeName.Player]: definition.player,
    [TypeName.State]: [definition.state, definition.lazyState],
    [TypeName.Effects]: definition.effects,
    [TypeName.Actions]: definition.actions,
  });

  const common: CodeEditorTypeDefs = zodToTS.declare();

  const cardEffectsProp: keyof RuntimeCard<G> = "effects";

  return {
    card: add(
      common,
      declareGlobalVariable({ name: "card", type: TypeName.Card }),
      declareModuleDefinition({
        definitionType: memberReference(TypeName.Card, cardEffectsProp),
        apiType: zodToTS(
          z.object({
            [scriptAPIProperties.card]: definition.card,
            [scriptAPIProperties.actions]: definition.actions,
          })
        ),
      })
    ),
    events: Object.entries(definition.effects.shape).reduce(
      (eventTypeDefs, [effectName, effectType]) => {
        eventTypeDefs[effectName as keyof G["actions"]] = add(
          common,
          declareModuleDefinition({
            definitionType: zodToTS(effectType),
            apiType: zodToTS(
              z.object({ [scriptAPIProperties.actions]: definition.actions })
            ),
          })
        );
        return eventTypeDefs;
      },
      {} as EditorApi<G>["events"]
    ),
  };
}

enum TypeName {
  Player = "Player",
  Card = "Card",
  State = "State",
  Effects = "EventHandlers",
  Actions = "EventDispatchers",
}

function declareModuleDefinition(p: {
  apiType: string;
  definitionType: string;
}) {
  return [
    `declare function define(definition: ${p.definitionType}): void;`,
    `declare function derive(createDefinition: (api: ${p.apiType}) => ${p.definitionType}): void;`,
  ].join("\n");
}

function declareGlobalVariable(p: { name: string; type: string }): string {
  return `declare const ${p.name}: ${p.type};`;
}

function declareType(typeName: string, type: Type): string {
  return `type ${typeName} = ${defineType(type)};`;
}

function memberReference(target: string, member: string) {
  return `${target}["${member}"]`;
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

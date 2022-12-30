import { z } from "zod";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import { zodToTSResolver } from "../../../lib/zod-extensions/zodToTS";
import type { RuntimeDefinition, RuntimeGenerics } from "./types";
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
    Card: definition.card,
    CardEffects: definition.card.shape.effects,
    Player: definition.player,
    State: [definition.state, definition.lazyState],
    EventHandlers: definition.effects,
    EventDispatchers: definition.actions,
  });

  const common: CodeEditorTypeDefs = zodToTS.declare();

  return {
    card: zodToTS.add(
      common,
      declareModuleDefinition({
        definitionType: zodToTS(definition.card.shape.effects),
        apiType: zodToTS(
          z.object({
            [scriptAPIProperties.cardId]: definition.card.shape.id,
            [scriptAPIProperties.actions]: definition.actions,
          })
        ),
      })
    ),
    events: Object.entries(definition.effects.shape).reduce(
      (eventTypeDefs, [effectName, effectType]) => {
        eventTypeDefs[effectName as keyof G["actions"]] = zodToTS.add(
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

function declareModuleDefinition(p: {
  apiType: string;
  definitionType: string;
}) {
  return [
    `declare function define(definition: ${p.definitionType}): void;`,
    `declare function derive(createDefinition: (api: ${p.apiType}) => ${p.definitionType}): void;`,
  ].join("\n");
}

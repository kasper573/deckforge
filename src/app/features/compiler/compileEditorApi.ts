import { z } from "zod";
import { omit } from "lodash";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import { zodToTSResolver } from "../../../lib/zod-extensions/zodToTS";
import type { RuntimeDefinition, RuntimeGenerics } from "./types";
import { createScriptApiDefinition } from "./compileGame";

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
    CardPile: definition.cardPile,
    CardEffects: definition.card.shape.effects,
    Player: definition.player,
    State: definition.state,
    EventHandlers: definition.effects,
    EventDispatchers: definition.actions,
  });

  const common: CodeEditorTypeDefs = zodToTS.declare();
  const scriptAPIShape = createScriptApiDefinition(definition);

  return {
    card: zodToTS.add(
      common,
      declareModuleDefinition({
        definitionType: zodToTS(definition.card.shape.effects),
        apiType: zodToTS(z.object(scriptAPIShape)),
      })
    ),
    events: Object.entries(definition.effects.shape).reduce(
      (eventTypeDefs, [effectName, effectType]) => {
        eventTypeDefs[effectName as keyof G["actions"]] = zodToTS.add(
          common,
          declareModuleDefinition({
            definitionType: zodToTS(effectType),
            apiType: zodToTS(z.object(omit(scriptAPIShape, "thisCardId"))),
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

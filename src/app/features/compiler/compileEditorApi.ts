import { z } from "zod";
import { omit } from "lodash";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import { zodToTSResolver } from "../../../lib/zod-extensions/zodToTS";
import type { RuntimeDefinition, RuntimeGenerics } from "./types";
import { createModuleApiDefinition } from "./defineRuntime";
import { moduleCompilerSymbols } from "./compileModule";

export interface EditorApi<G extends RuntimeGenerics> {
  card: CodeEditorTypeDefs;
  middleware: CodeEditorTypeDefs;
  events: {
    [K in keyof G["actions"]]: CodeEditorTypeDefs;
  };
}

export function compileEditorApi<G extends RuntimeGenerics>(
  definition: RuntimeDefinition<G>
): EditorApi<G> {
  const zodToTS = zodToTSResolver({
    PlayerId: definition.player.shape.id,
    DeckId: definition.deck.shape.id,
    CardTypeId: definition.card.shape.typeId,
    CardInstanceId: definition.card.shape.id,
    Card: definition.card,
    CardPile: definition.cardPile,
    CardEffects: definition.cardEffects,
    Deck: definition.deck,
    Player: definition.player,
    State: definition.state,
    EventHandlers: definition.effects,
    EventDispatchers: definition.actions,
    Middleware: definition.middleware,
  });

  const common: CodeEditorTypeDefs = zodToTS.declare();
  const scriptAPIShape = createModuleApiDefinition(definition);
  const generalApiType = zodToTS(z.object(omit(scriptAPIShape, "thisCardId")));
  const cardApiType = zodToTS(z.object(scriptAPIShape));

  return {
    middleware: zodToTS.add(
      common,
      declareModuleDefinition({
        definitionType: zodToTS(definition.middleware),
        apiType: generalApiType,
      })
    ),
    card: zodToTS.add(
      common,
      declareModuleDefinition({
        definitionType: zodToTS(definition.cardEffects),
        apiType: cardApiType,
      })
    ),
    events: Object.entries(definition.effects.shape).reduce(
      (eventTypeDefs, [effectName, effectType]) => {
        eventTypeDefs[effectName as keyof G["actions"]] = zodToTS.add(
          common,
          declareModuleDefinition({
            definitionType: zodToTS(effectType),
            apiType: generalApiType,
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
  return `declare function ${moduleCompilerSymbols.defineName}(definition: ${p.definitionType}): void;`;
}

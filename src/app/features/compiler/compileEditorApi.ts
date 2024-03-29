import type { ZodRawShape } from "zod";
import { omit } from "lodash";
import type { CodeEditorTypeDefs } from "../../components/CodeEditor";
import { zodToTSResolver } from "../../../lib/zod-extensions/zodToTS";
import type { RuntimeDefinition, RuntimeGenerics } from "./types";
import { createModuleApiDefinition } from "./defineRuntime";

export interface EditorApi<G extends RuntimeGenerics> {
  card: CodeEditorTypeDefs;
  reducer: CodeEditorTypeDefs;
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
    CardEffects: definition.cardEffects,
    Deck: definition.deck,
    Player: definition.player,
    State: definition.state,
    Events: definition.effects,
    Reducer: definition.reducer,
  });

  const common: CodeEditorTypeDefs = zodToTS.declare();

  return {
    reducer: zodToTS.add(
      common,
      declareModuleGlobals(
        omit(
          createModuleApiDefinition(definition, definition.reducer),
          "thisCardId"
        )
      )
    ),
    card: zodToTS.add(
      common,
      declareModuleGlobals(
        createModuleApiDefinition(definition, definition.cardEffects)
      )
    ),
    events: Object.entries(definition.effects.shape).reduce(
      (eventTypeDefs, [effectName, effectType]) => {
        eventTypeDefs[effectName as keyof G["actions"]] = zodToTS.add(
          common,
          declareModuleGlobals(
            omit(
              createModuleApiDefinition(definition, effectType),
              "thisCardId"
            )
          )
        );
        return eventTypeDefs;
      },
      {} as EditorApi<G>["events"]
    ),
  };

  function declareModuleGlobals(shape: ZodRawShape) {
    return Object.entries(shape)
      .map(
        ([propName, propType]) =>
          `declare const ${propName}: ${zodToTS(propType)};`
      )
      .join("\n");
  }
}

import { z } from "zod";
import { defineRuntime, runtimeEvent } from "../../compiler/defineRuntime";
import { createReactAdapter } from "../../../../lib/machine/createReactAdapter";
import { cardIdType } from "../../../../api/services/game/types";
import type { ZodTypesFor } from "../../../../lib/zod-extensions/ZodShapeFor";
import type {
  RuntimeGenericsFor,
  RuntimeMachineContext,
} from "../../compiler/types";

export const builtinDefinition = defineRuntime({
  playerProperties: {
    health: z.number(),
  },
  cardProperties: {},
  actions: ({ playerId }) => {
    const cardPayload = z.object({
      playerId,
      cardId: cardIdType,
    });
    return {
      startBattle: runtimeEvent(),
      endTurn: runtimeEvent(),
      drawCard: runtimeEvent(playerId),
      playCard: runtimeEvent(cardPayload.and(z.object({ targetId: playerId }))),
      discardCard: runtimeEvent(cardPayload),
    };
  },
});

export type React1v1Definition = typeof builtinDefinition;
export type React1v1Generics = RuntimeGenericsFor<React1v1Definition>;
export type React1v1Types = ZodTypesFor<React1v1Definition>;
export type React1v1MachineContext = RuntimeMachineContext<React1v1Generics>;

export const adapter = createReactAdapter<React1v1MachineContext>();

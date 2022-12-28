import { z } from "zod";
import {
  createRuntimeDefinition,
  runtimeEvent,
} from "../../runtime/createRuntimeDefinition";
import { createReactRuntimeAdapter } from "../../runtime/ReactRuntimeAdapter";
import { cardIdType } from "../../../../api/services/game/types";

export const builtinDefinition = createRuntimeDefinition({
  playerProperties: {
    health: z.number(),
  },
  cardProperties: {},
  events: ({ playerId }) => {
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

type BuiltinSchemas = typeof builtinDefinition;
export type Builtins = {
  [K in keyof BuiltinSchemas]: z.infer<BuiltinSchemas[K]>;
};

export const adapter = createReactRuntimeAdapter(builtinDefinition);

import { z } from "zod";
import { defineRuntime, runtimeEvent } from "../../../compiler/defineRuntime";
import { createReactAdapter } from "../../../../../lib/machine/createReactAdapter";
import type { inferFromZodShape } from "../../../../../lib/zod-extensions/ZodShapeFor";
import type {
  RuntimeGenericsFor,
  RuntimeMachineContext,
} from "../../../compiler/types";
import { cardInstanceIdType } from "../../../compiler/types";

export const builtinDefinition = defineRuntime({
  playerProperties: {
    health: z.number(),
    healthMax: z.number(),
    mana: z.number(),
    manaMax: z.number(),
  },
  cardProperties: {
    manaCost: z.number(),
  },
  actions: ({ playerId, deckId }) => {
    const cardPayload = z.object({
      playerId,
      cardId: cardInstanceIdType,
    });
    return {
      restartGame: runtimeEvent(),
      startBattle: runtimeEvent(
        z.object({
          player1Deck: deckId,
          player2Deck: deckId,
        })
      ),
      nextTurn: runtimeEvent(),
      drawCard: runtimeEvent(playerId),
      playCard: runtimeEvent(cardPayload.and(z.object({ targetId: playerId }))),
      discardCard: runtimeEvent(cardPayload),
    };
  },
});

export type React1v1Definition = typeof builtinDefinition;
export type React1v1Generics = RuntimeGenericsFor<React1v1Definition>;
export type React1v1Types = inferFromZodShape<React1v1Definition>;
export type React1v1MachineContext = RuntimeMachineContext<React1v1Generics>;

export const adapter = createReactAdapter<React1v1MachineContext>();

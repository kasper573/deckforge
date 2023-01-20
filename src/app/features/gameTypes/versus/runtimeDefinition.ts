import { z } from "zod";
import { defineRuntime, runtimeEvent } from "../../compiler/defineRuntime";
import { createReactAdapter } from "../../../../lib/machine/createReactAdapter";
import type { inferFromZodShape } from "../../../../lib/zod-extensions/ZodShapeFor";
import type {
  RuntimeGenericsFor,
  RuntimeMachineContext,
} from "../../compiler/types";
import { cardInstanceIdType } from "../../compiler/types";

export const versusDefinition = defineRuntime({
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

export type VersusDefinition = typeof versusDefinition;
export type VersusGenerics = RuntimeGenericsFor<VersusDefinition>;
export type VersusTypes = inferFromZodShape<VersusDefinition>;
export type VersusMachineContext = RuntimeMachineContext<VersusGenerics>;

export const adapter = createReactAdapter<VersusMachineContext>();

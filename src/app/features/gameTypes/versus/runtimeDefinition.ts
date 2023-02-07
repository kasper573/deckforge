import { z } from "zod";
import { defineRuntime, runtimeEvent } from "../../compiler/defineRuntime";
import { createReactAdapter } from "../../../../lib/machine/createReactAdapter";
import type { inferFromZodShape } from "../../../../lib/zod-extensions/ZodShapeFor";
import type {
  RuntimeGenericsFor,
  RuntimeMachineContext,
} from "../../compiler/types";
import { cardInstanceIdType } from "../../compiler/types";

export const runtimeDefinition = defineRuntime({
  playerProperties: {
    health: z.number(),
    healthMax: z.number(),
    mana: z.number(),
    manaMax: z.number(),
  },
  cardProperties: {
    manaCost: z.number(),
  },
  globalProperties: ({ playerId }) => ({
    currentPlayerId: playerId,
    status: z.union([
      z.object({ type: z.literal("idle") }),
      z.object({ type: z.literal("battle") }),
      z.object({ type: z.literal("result"), winner: playerId }),
    ]),
  }),
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
  initialState: ({ decks, createPlayer }) => {
    const p1 = createPlayer();
    const p2 = createPlayer();
    return {
      players: [p1, p2],
      decks,
      properties: {
        status: { type: "idle" as const },
        currentPlayerId: p1.id,
      },
    };
  },
});

export type VersusDefinition = typeof runtimeDefinition;

export type VersusGenerics = RuntimeGenericsFor<VersusDefinition>;
export type VersusTypes = inferFromZodShape<VersusDefinition>;
export type VersusGameStatus = VersusTypes["globals"]["status"];
export type VersusMachineContext = RuntimeMachineContext<VersusGenerics>;

export const adapter = createReactAdapter<VersusMachineContext>();

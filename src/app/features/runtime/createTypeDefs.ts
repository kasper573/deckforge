import type { ZodRawShape } from "zod";
import { z } from "zod";
import { cardType as cardDefinitionType } from "../../../api/services/game/types";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import type { NominalString } from "../../../lib/NominalString";

export function createRuntimeTypeDefs<
  PlayerProperties extends ZodRawShape,
  CardProperties extends ZodRawShape
>({
  playerProperties,
  cardProperties,
}: {
  playerProperties: PlayerProperties;
  cardProperties: CardProperties;
}) {
  const effect = z.function();
  const effects = z.record(effect);
  const action = z.function();
  const actions = z.record(action);

  const card = z.object({
    id: cardDefinitionType.shape.cardId,
    name: cardDefinitionType.shape.name,
    properties: z.object(cardProperties),
    effects,
  });

  const cardPile = z.array(card);

  const playerId = zodNominalString<NominalString<"PlayerId">>();

  const player = z.object({
    id: playerId,
    properties: z.object({
      health: z.number(),
      ...playerProperties,
    }),
    cards: z.object({
      deck: cardPile,
      draw: cardPile,
      hand: cardPile,
      discard: cardPile,
    }),
  });

  const state = z.object({
    players: z.tuple([player, player]),
    winner: playerId.optional(),
  });

  return {
    card,
    cardPile,
    player,
    playerId,
    state,
    effect,
    effects,
    action,
    actions,
  };
}

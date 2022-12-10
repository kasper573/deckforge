import { z } from "zod";
import type { NominalString } from "../../../lib/NominalString";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import { codeType } from "../../utils/codeType";

export type GameId = NominalString<"GameId">;
export const gameIdType = zodNominalString<GameId>();

export type EntityId = z.infer<typeof entityIdType>;
export const entityIdType = z.enum(["player", "card"]);

export type PropertyType = z.infer<typeof propertyValueType>;
export const propertyValueType = z.enum(["string", "number", "boolean"]);
export const propertyValueTypes = {
  string: z.string().default(""),
  number: z.number().default(0),
  boolean: z.boolean().default(false),
};

export type PropertyId = NominalString<"PropertyId">;
export const propertyIdType = zodNominalString<PropertyId>();

export type Property = z.infer<typeof propertyType>;
export const propertyType = z.object({
  entityId: entityIdType,
  propertyId: propertyIdType,
  name: z.string().min(1).max(32),
  type: propertyValueType,
});

export type PropertyValues = z.infer<typeof propertyValuesType>;
export const propertyValuesType = z.record(propertyIdType, z.unknown());

export type ActionId = NominalString<"ActionId">;
export const actionIdType = zodNominalString<ActionId>();

export type Action = z.infer<typeof actionType>;
export const actionType = z.object({
  actionId: actionIdType,
  name: z.string().min(1).max(32),
  code: codeType,
});

export type ReactionId = NominalString<"ReactionId">;
export const reactionIdType = zodNominalString<ReactionId>();

export type Reaction = z.infer<typeof reactionType>;
export const reactionType = z.object({
  reactionId: reactionIdType,
  name: z.string().min(1).max(32),
  actionId: actionType.shape.actionId,
  code: codeType,
});

export type DeckId = NominalString<"DeckId">;
export const deckIdType = zodNominalString<DeckId>();

export type Deck = z.infer<typeof deckType>;
export const deckType = z.object({
  deckId: deckIdType,
  name: z.string().min(1).max(32),
});

export type CardId = NominalString<"CardId">;
export const cardIdType = zodNominalString<CardId>();

export type Card = z.infer<typeof cardType>;
export const cardType = z.object({
  cardId: cardIdType,
  code: codeType,
  name: z.string().min(1).max(32),
  deckId: z.string(),
  propertyDefaults: propertyValuesType,
});

export type GameDefinition = z.infer<typeof gameDefinitionType>;
export const gameDefinitionType = z.object({
  decks: z.array(deckType).default([]),
  cards: z.array(cardType).default([]),
  properties: z.array(propertyType).default([]),
  actions: z.array(actionType).default([]),
  reactions: z.array(reactionType).default([]),
});

export type Game = z.infer<typeof gameType>;
export const gameType = z.object({
  gameId: gameIdType,
  name: z.string().min(1).max(32),
  definition: gameDefinitionType,
  ownerId: z.string(),
});

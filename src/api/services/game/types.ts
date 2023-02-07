import { z } from "zod";
import { zodRuntimeBranded } from "../../../lib/zod-extensions/zodRuntimeBranded";
import { codeType } from "../../utils/codeType";
import { zodIdentifier } from "../../utils/zodIdentifier";
import type {
  TypeOf,
  TypeOfShape,
} from "../../../lib/zod-extensions/createTypeSerializer";
import { createSerializableType } from "../../../lib/zod-extensions/createTypeSerializer";

export type GameId = z.infer<typeof gameIdType>;
export const gameIdType = zodRuntimeBranded("GameId");

export type EntityId = z.infer<typeof entityIdType>;
export const entityIdType = z.enum(["player", "card"]);

export type PrimitiveTypes = TypeOfShape<typeof primitiveTypes>;
export const primitiveTypes = {
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),
  void: z.void(),
};

export type PropertyValueType = z.infer<typeof propertyValue.serializedType>;

export type TypeOfPropertyValue<T extends PropertyValueType> = TypeOf<
  T,
  PrimitiveTypes
>;

export const propertyValue = createSerializableType(primitiveTypes, {
  string: "",
  number: 0,
  boolean: false,
  void: void 0,
});

export type PropertyId = z.infer<typeof propertyIdType>;
export const propertyIdType = zodRuntimeBranded("PropertyId");

export type PropertyDefault = z.infer<typeof propertyDefaultType>;
export const propertyDefaultType = z.unknown();

export type PropertyDefaults = z.infer<typeof propertyDefaultsType>;
export const propertyDefaultsType = z.record(
  propertyIdType,
  propertyDefaultType
);

export type Property = z.infer<typeof propertyType>;
export const propertyType = z.object({
  entityId: entityIdType,
  propertyId: propertyIdType,
  name: zodIdentifier,
  type: propertyValue.serializedType,
  defaultValue: propertyDefaultType,
});

export type EventId = z.infer<typeof eventIdType>;
export const eventIdType = zodRuntimeBranded("EventId");

export type Event = z.infer<typeof eventType>;
export const eventType = z.object({
  eventId: eventIdType,
  name: zodIdentifier,
  code: codeType,
  inputType: propertyValue.serializedType,
});

export type MiddlewareId = z.infer<typeof middlewareIdType>;
export const middlewareIdType = zodRuntimeBranded("MiddlewareId");

export type Middleware = z.infer<typeof middlewareType>;
export const middlewareType = z.object({
  middlewareId: middlewareIdType,
  name: z.string().min(1).max(32),
  code: codeType,
});

export type DeckId = z.infer<typeof deckIdType>;
export const deckIdType = zodRuntimeBranded("DeckId");

export type Deck = z.infer<typeof deckType>;
export const deckType = z.object({
  deckId: deckIdType,
  name: z.string().min(1).max(32),
});

export type CardId = z.infer<typeof cardIdType>;
export const cardIdType = zodRuntimeBranded("CardId");

export type Card = z.infer<typeof cardType>;
export const cardType = z.object({
  cardId: cardIdType,
  code: codeType,
  name: z.string().min(1).max(32),
  deckId: deckIdType,
  propertyDefaults: propertyDefaultsType,
});

export type GameDefinition = z.infer<typeof gameDefinitionType>;
export const gameDefinitionType = z.object({
  decks: z.array(deckType).default([]),
  cards: z.array(cardType).default([]),
  properties: z.array(propertyType).default([]),
  events: z.array(eventType).default([]),
  middlewares: z.array(middlewareType).default([]),
});

export type GameTypeId = z.infer<typeof gameTypeIdType>;
export const gameTypeIdType = zodRuntimeBranded("GameTypeId");

export type Game = z.infer<typeof gameType>;
export const gameType = z.object({
  gameId: gameIdType,
  updatedAt: z.date(),
  type: gameTypeIdType,
  name: z.string().min(1).max(32),
  slug: z.string(),
  definition: gameDefinitionType,
  ownerId: z.string(),
});

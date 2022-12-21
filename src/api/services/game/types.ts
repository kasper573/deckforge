import { z } from "zod";
import type { NominalString } from "../../../lib/NominalString";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";
import { codeType } from "../../utils/codeType";
import { zodIdentifier } from "../../utils/zodIdentifier";
import type {
  TypeOf,
  TypeOfShape,
} from "../../../lib/zod-extensions/createTypeSerializer";
import { createSerializableType } from "../../../lib/zod-extensions/createTypeSerializer";

export type GameId = NominalString<"GameId">;
export const gameIdType = zodNominalString<GameId>();

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

export type PropertyId = NominalString<"PropertyId">;
export const propertyIdType = zodNominalString<PropertyId>();

export type Property = z.infer<typeof propertyType>;
export const propertyType = z.object({
  entityId: entityIdType,
  propertyId: propertyIdType,
  name: zodIdentifier,
  type: propertyValue.serializedType,
});

export type PropertyDefaults = z.infer<typeof propertyDefaultsType>;
export const propertyDefaultsType = z.record(propertyIdType, z.unknown());

export type EventId = NominalString<"EventId">;
export const eventIdType = zodNominalString<EventId>();

export type Event = z.infer<typeof eventType>;
export const eventType = z.object({
  eventId: eventIdType,
  name: zodIdentifier,
  code: codeType,
  inputType: propertyValue.serializedType,
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
  deckId: deckIdType,
  propertyDefaults: propertyDefaultsType,
});

export type GameDefinition = z.infer<typeof gameDefinitionType>;
export const gameDefinitionType = z.object({
  decks: z.array(deckType).default([]),
  cards: z.array(cardType).default([]),
  properties: z.array(propertyType).default([]),
  events: z.array(eventType).default([]),
});

export type Game = z.infer<typeof gameType>;
export const gameType = z.object({
  gameId: gameIdType,
  updatedAt: z.date(),
  name: z.string().min(1).max(32),
  definition: gameDefinitionType,
  ownerId: z.string(),
});

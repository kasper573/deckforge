import { createSelector } from "@reduxjs/toolkit";
import type {
  EventId,
  CardId,
  DeckId,
  EntityId,
  PropertyId,
  MiddlewareId,
} from "../../../api/services/game/types";
import { getKeyVisibilities } from "../../../lib/reactMosaicExtensions";
import { compileEditorApi } from "../compiler/compileEditorApi";
import { deriveRuntimeDefinition } from "../compiler/defineRuntime";
import { gameTypes } from "../gameTypes";
import type { EditorObjectId, EditorState } from "./types";

const gameDefinition = (state: EditorState) => state.game?.definition;

const runtimeDefinition = createSelector(gameDefinition, (def) =>
  def ? deriveRuntimeDefinition(def) : undefined
);

const editorApi = createSelector(runtimeDefinition, (def) =>
  def ? compileEditorApi(def) : undefined
);

export const selectors = {
  panelLayout: (state: EditorState) => state.panelLayout,
  panelVisibilities: (state: EditorState) =>
    getKeyVisibilities(state.panelLayout),
  selectedObjectId: (state: EditorState) => state.selectedObjectId,
  selectedObjectBreadcrumbs(state: EditorState): string[] | undefined {
    const { selectedObjectId: id } = state;
    if (!id) {
      return;
    }
    switch (id.type) {
      case "event":
        return [selectors.event(id.eventId)(state)?.name ?? ""];
      case "middleware":
        return [selectors.middleware(id.middlewareId)(state)?.name ?? ""];
      case "card":
        const card = selectors.card(id.cardId)(state);
        const deck = card && selectors.deck(card.deckId)(state);
        return [deck?.name ?? "", card?.name ?? ""];
    }
  },
  game: (state: EditorState) => state.game,
  gameType: (state: EditorState) => state.game?.type,
  decks: (state: EditorState) => state.game?.definition.decks ?? [],
  decksAndCards: (state: EditorState) => {
    if (!state.game) {
      return [];
    }
    const { decks, cards } = state.game.definition;
    return decks.map((deck) => ({
      objectId: { type: "deck", deckId: deck.deckId } as EditorObjectId,
      ...deck,
      cards: cards
        .filter((card) => card.deckId === deck.deckId)
        .map((card) => ({
          objectId: { type: "card", cardId: card.cardId } as EditorObjectId,
          ...card,
        })),
    }));
  },
  events: (state: EditorState) => {
    if (!state.game) {
      return [];
    }
    const { events } = state.game.definition;
    return events.map((event) => ({
      objectId: { type: "event", eventId: event.eventId } as EditorObjectId,
      ...event,
    }));
  },
  middlewares: (state: EditorState) => {
    if (!state.game) {
      return [];
    }
    const { middlewares } = state.game.definition;
    return middlewares.map((middleware) => ({
      objectId: {
        type: "middleware",
        middlewareId: middleware.middlewareId,
      } as EditorObjectId,
      ...middleware,
    }));
  },
  deck: (deckId: DeckId) => (state: EditorState) =>
    state.game?.definition.decks.find((d) => d.deckId === deckId),
  card: (cardId: CardId) => (state: EditorState) =>
    state.game?.definition.cards.find((c) => c.cardId === cardId),
  event: (eventId: EventId) => (state: EditorState) =>
    state.game?.definition.events.find((a) => a.eventId === eventId),
  middleware: (middlewareId: MiddlewareId) => (state: EditorState) =>
    state.game?.definition.middlewares.find(
      (a) => a.middlewareId === middlewareId
    ),
  property: (propertyId: PropertyId) => (state: EditorState) =>
    state.game?.definition.properties.find((p) => p.propertyId === propertyId),
  propertiesFor: (entityId: EntityId) => (state: EditorState) =>
    state.game?.definition.properties
      .filter((p) => p.entityId === entityId)
      .map((property) => ({
        objectId: {
          type: "property",
          propertyId: property.propertyId,
        } as EditorObjectId,
        ...property,
      })) ?? [],

  logs: (state: EditorState) => state.logs,

  gameDefinition,
  runtimeDefinition,
  builtinDefinition: (state: EditorState) =>
    state.game ? gameTypes.get(state.game.type)?.runtimeDefinition : undefined,
  editorApi,
};

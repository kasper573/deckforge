import { createSelector } from "@reduxjs/toolkit";
import { omit } from "lodash";
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
import { adjacent } from "../../../lib/adjacent";
import type { EditorObjectId, EditorState } from "./types";

const gameDefinition = (state: EditorState) => state.game?.definition;

const runtimeDefinition = createSelector(gameDefinition, (def) =>
  def ? deriveRuntimeDefinition(def) : undefined
);

const editorApi = createSelector(runtimeDefinition, (def) =>
  def ? compileEditorApi(def) : undefined
);

function adjacentSelectedObject(
  state: EditorState
): EditorObjectId | undefined {
  const id = state.selectedObjectId;
  const list = selectedList(state);
  const obj = objectById(state.selectedObjectId)(state);
  const adj = adjacent(list, obj);
  if (id && adj) {
    const prop = getObjectIdProperty(id);
    return { ...id, [prop]: adj[prop] };
  }
}

function selectedList(state: EditorState) {
  switch (state.selectedObjectId?.type) {
    case "event":
      return state.game?.definition.events;
    case "middleware":
      return state.game?.definition.middlewares;
    case "card":
      return state.game?.definition.cards;
    case "deck":
      return state.game?.definition.decks;
  }
}

function objectById(id?: EditorObjectId) {
  return (state: EditorState) => {
    switch (id?.type) {
      case "event":
        return selectors.event(id.eventId)(state);
      case "middleware":
        return selectors.middleware(id.middlewareId)(state);
      case "card":
        return selectors.card(id.cardId)(state);
      case "deck":
        return selectors.deck(id.deckId)(state);
    }
  };
}

function getObjectIdProperty<T extends EditorObjectId>(id: T) {
  type IdProperty = keyof Omit<T, "type">;
  const idProperty = Object.keys(omit(id, "type"))[0];
  return idProperty as IdProperty;
}

export const selectors = {
  panelLayout: (state: EditorState) => state.panelLayout,
  panelVisibilities: (state: EditorState) =>
    getKeyVisibilities(state.panelLayout),
  adjacentSelectedObject,
  selectedList,
  objectById,
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

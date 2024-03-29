import { createSelector } from "@reduxjs/toolkit";
import type {
  CardId,
  DeckId,
  EntityId,
  EventId,
  ReducerId,
  PropertyId,
} from "../../../api/services/game/types";
import { getKeyVisibilities } from "../../../lib/reactMosaicExtensions";
import { compileEditorApi } from "../compiler/compileEditorApi";
import { deriveRuntimeDefinition } from "../compiler/defineRuntime";
import { gameTypes } from "../gameTypes";
import type { EditorObjectId, EditorState, EditorSyncState } from "./types";
import {
  adjacentSelectedObject,
  objectById,
  selectedList,
} from "./utils/objectUtils";

const gameDefinition = (state: EditorState) => state.game?.definition;

const builtinDefinition = (state: EditorState) =>
  state.game ? gameTypes.get(state.game.type)?.runtimeDefinition : undefined;

const runtimeDefinition = createSelector(
  gameDefinition,
  builtinDefinition,
  (game, builtin) =>
    game && builtin ? deriveRuntimeDefinition(game, builtin) : undefined
);

const editorApi = createSelector(runtimeDefinition, (def) =>
  def ? compileEditorApi(def) : undefined
);

export const selectors = {
  isSyncState:
    (...oneOf: EditorSyncState[]) =>
    (state: EditorState) =>
      oneOf.includes(state.syncState),
  syncState: (state: EditorState) => state.syncState,
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
      case "reducer":
        return [selectors.reducer(id.reducerId)(state)?.name ?? ""];
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
  reducers: (state: EditorState) => {
    if (!state.game) {
      return [];
    }
    const { reducers } = state.game.definition;
    return reducers.map((reducer) => ({
      objectId: {
        type: "reducer",
        reducerId: reducer.reducerId,
      } as EditorObjectId,
      ...reducer,
    }));
  },
  deck: (deckId: DeckId) => (state: EditorState) =>
    state.game?.definition.decks.find((d) => d.deckId === deckId),
  card: (cardId: CardId) => (state: EditorState) =>
    state.game?.definition.cards.find((c) => c.cardId === cardId),
  event: (eventId: EventId) => (state: EditorState) =>
    state.game?.definition.events.find((a) => a.eventId === eventId),
  reducer: (reducerId: ReducerId) => (state: EditorState) =>
    state.game?.definition.reducers.find((a) => a.reducerId === reducerId),
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
  builtinDefinition,
  editorApi,
};

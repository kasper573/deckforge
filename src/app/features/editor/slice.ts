import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import produce from "immer";
import type {
  Card,
  Deck,
  Event,
  Game,
  GameDefinition,
  Middleware,
  Property,
} from "../../../api/services/game/types";
import { propertyValue } from "../../../api/services/game/types";
import {
  createEntityReducerFactory,
  createId,
} from "../../../lib/createEntityReducers";
import type { MakePartial } from "../../../lib/ts-extensions/MakePartial";
import { createZodStorage } from "../../../lib/zod-extensions/zodStorage";
import {
  addNodeBySplitting,
  removeNodeByKey,
} from "../../../lib/reactMosaicExtensions";
import type {
  EditorObjectId,
  EditorState,
  EditorSyncState,
  LogEntry,
  PanelId,
  PanelLayout,
} from "./types";
import { editorObjectIdType, panelLayoutType } from "./types";
import { defaultPanelLayout } from "./panels/defaultPanelLayout";
import { selectors } from "./selectors";
import { moveObject } from "./reducers/moveObject";

const panelStorage = createZodStorage(
  panelLayoutType,
  "panel-layout",
  defaultPanelLayout
);

const selectedObjectStorage = createZodStorage(
  editorObjectIdType,
  "selected-object"
);

const initialState: EditorState = {
  syncState: "dirty",
  selectedObjectId: selectedObjectStorage.load(),
  panelLayout: panelStorage.load(),
  logs: [],
};

const entityReducers = createEntityReducerFactory<EditorState>();

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setSyncState(state, { payload }: PayloadAction<EditorSyncState>) {
      state.syncState = payload;
    },
    selectGame: (
      state,
      { payload: newGame }: PayloadAction<Game | undefined>
    ) => {
      state.game = newGame;
    },
    renameGame({ game }, { payload: newName }: PayloadAction<string>) {
      if (game) {
        game.name = newName;
      }
    },
    overwriteGameDefinition(state, { payload }: PayloadAction<GameDefinition>) {
      if (state.game) {
        state.game.definition = payload;
      }
    },
    clearLogs(state) {
      state.logs = [];
    },
    log(state, { payload: content }: PayloadAction<LogEntry["content"]>) {
      state.logs.push({
        id: createId(),
        content,
      });
    },
    selectObject(state, { payload: newId }: PayloadAction<EditorObjectId>) {
      state.selectedObjectId = newId;
    },
    setPanelLayout(
      state,
      { payload: newLayout }: PayloadAction<PanelLayout | null>
    ) {
      state.panelLayout = newLayout ?? defaultPanelLayout;
    },
    setPanelVisibility(
      state,
      { payload }: PayloadAction<{ id: PanelId; visible: boolean }>
    ) {
      const isVisible = selectors.panelVisibilities(state)[payload.id];
      if (isVisible !== payload.visible) {
        state.panelLayout = payload.visible
          ? addNodeBySplitting(state.panelLayout, payload.id)
          : removeNodeByKey(state.panelLayout, payload.id);
      }
    },
    ...entityReducers<Property>()(
      "Property",
      "propertyId",
      (state) => state.game?.definition.properties ?? []
    ),
    ...entityReducers<Deck>()(
      "Deck",
      "deckId",
      (state) => state.game?.definition.decks ?? []
    ),
    ...entityReducers<Event>()(
      "Event",
      "eventId",
      (state) => state.game?.definition.events ?? []
    ),
    ...entityReducers<Middleware>()(
      "Middleware",
      "middlewareId",
      (state) => state.game?.definition.middlewares ?? []
    ),
    ...entityReducers<Card>()(
      "Card",
      "cardId",
      (state) => state.game?.definition.cards ?? []
    ),
    createDeck(
      state,
      { payload }: PayloadAction<MakePartial<Omit<Deck, "deckId">, "name">>
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.decks.push({
        deckId: createId(),
        name: "New Deck",
        ...payload,
      });
    },
    deleteDeck({ game }, { payload: id }: PayloadAction<Deck["deckId"]>) {
      if (!game) {
        return;
      }
      const { definition } = game;
      definition.decks = definition.decks.filter((deck) => deck.deckId !== id);
      definition.cards = definition.cards.filter((card) => card.deckId !== id);
    },
    createCard(
      state,
      {
        payload,
      }: PayloadAction<
        MakePartial<Omit<Card, "cardId">, "name" | "code" | "propertyDefaults">
      >
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.cards.push({
        cardId: createId(),
        name: "New Card",
        code: "",
        propertyDefaults: {},
        ...payload,
      });
    },
    createEvent(
      state,
      {
        payload,
      }: PayloadAction<
        MakePartial<Omit<Event, "eventId">, "name" | "code" | "inputType">
      >
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.events.push({
        eventId: createId(),
        name: "newEvent",
        code: "",
        inputType: "void",
        ...payload,
      });
    },
    createMiddleware(
      state,
      {
        payload,
      }: PayloadAction<
        MakePartial<Omit<Middleware, "middlewareId">, "name" | "code">
      >
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.middlewares.push({
        middlewareId: createId(),
        name: "New middleware",
        code: "",
        ...payload,
      });
    },
    moveObject,
    createProperty(
      state,
      {
        payload: { type = "number", ...payload },
      }: PayloadAction<
        MakePartial<
          Omit<Property, "propertyId">,
          "name" | "type" | "defaultValue"
        >
      >
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.properties.push({
        propertyId: createId(),
        name: "newProperty",
        type,
        defaultValue: propertyValue.defaultOf(type),
        ...payload,
      });
    },
  },
});

export const { actions, getInitialState } = editorSlice;

export const reducer: typeof editorSlice.reducer = (
  state = editorSlice.getInitialState(),
  action
) => {
  const previousState = state;

  const fallbackObjectId = selectors.adjacentSelectedObject(state);

  let newState = editorSlice.reducer(state, action);

  // Ensure that the selected object still exists, fall back to the adjacent one
  // (this can happen on deletes, or when local storage selection contains old data)
  if (
    newState.game &&
    !selectors.objectById(newState.selectedObjectId)(newState)
  ) {
    const fallbackExist = selectors.objectById(fallbackObjectId)(newState);
    newState = produce(newState, (draft) => {
      draft.selectedObjectId = fallbackExist ? fallbackObjectId : undefined;
    });
  }

  // Persist layout and selection changes in local storage
  if (newState.selectedObjectId !== previousState.selectedObjectId) {
    selectedObjectStorage.save(newState.selectedObjectId);
  }
  if (newState.panelLayout !== previousState.panelLayout) {
    panelStorage.save(newState.panelLayout);
  }

  return newState;
};

export const noUndoActionList: Array<keyof typeof actions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${String(name)}`
);

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type {
  Action,
  Card,
  Deck,
  Game,
  Property,
} from "../../../api/services/game/types";
import {
  createEntityReducerFactory,
  createId,
} from "../../../lib/createEntityReducers";
import type { MakePartial } from "../../../lib/MakePartial";
import { createZodStorage } from "../../../lib/zod-extensions/zodStorage";
import {
  addNodeBySplitting,
  removeNodeByKey,
} from "../../../lib/reactMosaicExtensions";
import type {
  EditorObjectId,
  EditorState,
  PanelId,
  PanelLayout,
} from "./types";
import { editorObjectIdType, panelLayoutType } from "./types";
import { defaultPanelLayout } from "./panels/defaultPanelLayout";
import { selectors } from "./selectors";

const panelStorage = createZodStorage(
  panelLayoutType.optional(),
  "panel-layout"
);

const selectedObjectStorage = createZodStorage(
  editorObjectIdType.optional(),
  "selected-object"
);

const initialState: EditorState = {
  selectedObjectId: selectedObjectStorage.load(),
  panelLayout: panelStorage.load(defaultPanelLayout),
};

const entityReducers = createEntityReducerFactory<EditorState>();

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
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
    ...entityReducers<Action>()(
      "Action",
      "actionId",
      (state) => state.game?.definition.actions ?? []
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
    createAction(
      state,
      {
        payload,
      }: PayloadAction<MakePartial<Omit<Action, "actionId">, "name" | "code">>
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.actions.push({
        actionId: createId(),
        name: "New Action",
        code: "",
        ...payload,
      });
    },
    createProperty(
      state,
      {
        payload,
      }: PayloadAction<
        MakePartial<Omit<Property, "propertyId">, "name" | "type">
      >
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.properties.push({
        propertyId: createId(),
        name: "New Property",
        type: "number",
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
  const currentState = state;
  const updatedState = editorSlice.reducer(state, action);

  if (updatedState.selectedObjectId !== currentState.selectedObjectId) {
    selectedObjectStorage.save(updatedState.selectedObjectId);
  }
  if (updatedState.panelLayout !== currentState.panelLayout) {
    panelStorage.save(updatedState.panelLayout);
  }

  return updatedState;
};

export const noUndoActionList: Array<keyof typeof actions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${String(name)}`
);

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type {
  Action,
  Card,
  Deck,
  Game,
  Property,
  Reaction,
} from "../../../api/services/game/types";
import {
  createEntityReducerFactory,
  createId,
} from "../../../lib/createEntityReducers";
import type { MakePartial } from "../../../lib/MakePartial";
import type { editorActions } from "./actions";
import type { EditorObjectId, EditorState } from "./types";
import { defaultPanelLayout } from "./panels/defaultPanelLayout";
import type { PanelLayout } from "./panels/definition";

const initialState: EditorState = {
  panelLayout: defaultPanelLayout,
};

const entityReducers = createEntityReducerFactory<EditorState>();

export const editorSlice = createSlice({
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
    ...entityReducers<Reaction>()(
      "Reaction",
      "reactionId",
      (state) => state.game?.definition.reactions ?? []
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
    createReaction(
      state,
      {
        payload,
      }: PayloadAction<
        MakePartial<Omit<Reaction, "reactionId">, "name" | "code">
      >
    ) {
      if (!state.game) {
        return;
      }
      state.game.definition.reactions.push({
        reactionId: createId(),
        name: "New Reaction",
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

export const noUndoActionList: Array<keyof typeof editorActions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${name}`
);

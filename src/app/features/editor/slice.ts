import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  Action,
  Card,
  Deck,
  Game,
  GameId,
  Property,
  Reaction,
} from "../../../api/services/game/types";
import {
  createEntityReducerFactory,
  createId,
} from "../../../lib/createEntityReducers";
import type { MakePartial } from "../../../lib/MakePartial";
import type { ThunkExtra } from "../../store";
import type { editorActions } from "./actions";
import type { EditorObjectId, EditorState } from "./types";

const initialState: EditorState = {};

const entityReducers = createEntityReducerFactory<EditorState>();

export const downloadGame = createAsyncThunk<
  Game,
  GameId,
  { extra: ThunkExtra }
>("editor/downloadGame", async (gameId, { extra: { trpc } }) =>
  trpc.game.read.query(gameId)
);

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    selectGame: (state, { payload: newGame }: PayloadAction<Game>) => {
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
  extraReducers: (builder) => {
    builder.addCase(downloadGame.pending, (state) => {
      state.game = undefined;
    });
    builder.addCase(downloadGame.fulfilled, (state, { payload: game }) => {
      state.game = game;
    });
  },
});

export const noUndoActionList: Array<keyof typeof editorActions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${name}`
);

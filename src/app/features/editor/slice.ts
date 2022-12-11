import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
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
import type { editorActions } from "./actions";
import type { EditorObjectId, EditorState } from "./types";

const initialState: EditorState = { game: emptyGame() };

const entityReducers = createEntityReducerFactory<EditorState>();

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    selectGame: (state, { payload: newGame }: PayloadAction<Game>) => {
      state.game = newGame;
    },
    renameGame({ game }, { payload: newName }: PayloadAction<string>) {
      game.name = newName;
    },
    selectObject(state, { payload: newId }: PayloadAction<EditorObjectId>) {
      state.selectedObjectId = newId;
    },

    ...entityReducers<Property>()(
      "Property",
      "propertyId",
      (state) => state.game.definition.properties
    ),
    ...entityReducers<Deck>()(
      "Deck",
      "deckId",
      (state) => state.game.definition.decks
    ),
    ...entityReducers<Action>()(
      "Action",
      "actionId",
      (state) => state.game.definition.actions
    ),
    ...entityReducers<Reaction>()(
      "Reaction",
      "reactionId",
      (state) => state.game.definition.reactions
    ),

    createDeck(
      state,
      { payload }: PayloadAction<MakePartial<Omit<Deck, "deckId">, "name">>
    ) {
      state.game.definition.decks.push({
        deckId: createId(),
        name: "New Deck",
        ...payload,
      });
    },
    ...entityReducers<Card>()(
      "Card",
      "cardId",
      (state) => state.game.definition.cards
    ),
    createCard(
      state,
      {
        payload,
      }: PayloadAction<
        MakePartial<Omit<Card, "cardId">, "name" | "code" | "propertyDefaults">
      >
    ) {
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
      state.game.definition.reactions.push({
        reactionId: createId(),
        name: "New Reaction",
        code: "",
        ...payload,
      });
    },
  },
});

export const noUndoActionList: Array<keyof typeof editorActions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${name}`
);

function emptyGame(): Game {
  return {
    ownerId: "invalid-user-id",
    gameId: "invalid-game-id" as GameId,
    name: "Empty Game",
    definition: {
      properties: [],
      decks: [],
      cards: [],
      actions: [],
      reactions: [],
    },
  };
}

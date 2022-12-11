import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type {
  Action,
  ActionId,
  Card,
  CardId,
  Deck,
  DeckId,
  Game,
  GameId,
  Property,
  Reaction,
  ReactionId,
} from "../../../api/services/game/types";
import {
  createEntityReducerFactory,
  createId,
} from "../../../lib/createEntityReducers";
import type { MakePartial } from "../../../lib/MakePartial";
import type { editorActions } from "./actions";

export type EditorObjectId =
  | { type: "action"; actionId: ActionId }
  | { type: "reaction"; reactionId: ReactionId }
  | { type: "deck"; deckId: DeckId }
  | { type: "card"; cardId: CardId };

export interface EditorState {
  game: Game;
  selectedObjectId?: EditorObjectId;
}

const initialState: EditorState = {
  game: emptyGame(),
};

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

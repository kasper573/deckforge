import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type {
  Action,
  ActionId,
  Card,
  CardId,
  Deck,
  DeckId,
  EntityId,
  Game,
  GameId,
  Property,
  Reaction,
  ReactionId,
} from "../../../api/services/game/types";
import { createEntityReducerFactory } from "../../../lib/createEntityReducers";

export type SelectedObject =
  | { type: "action"; actionId: ActionId }
  | { type: "reaction"; reactionId: ReactionId };

export interface EditorState {
  game: Game;
  selectedObject?: SelectedObject;
}

const initialState: EditorState = {
  game: emptyGame(),
};

const entityReducers = createEntityReducerFactory<EditorState>();

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    selectGame: (state, { payload: newGame }: PayloadAction<Game>) => {
      state.game = newGame;
    },
    renameGame({ game }, { payload: newName }: PayloadAction<string>) {
      game.name = newName;
    },
    selectObject(state, { payload: newObject }: PayloadAction<SelectedObject>) {
      state.selectedObject = newObject;
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
    ...entityReducers<Card>()(
      "Card",
      "cardId",
      (state) => state.game.definition.cards
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
  },
});

export const {
  actions: editorActions,
  reducer: editorReducer,
  getInitialState: getInitialEditorState,
} = editorSlice;

export const selectors = {
  selectedObject: (state: EditorState) => state.selectedObject,
  game: (state: EditorState) => state.game,
  decks: (state: EditorState) => state.game.definition.decks,
  decksAndCards: (state: EditorState) => {
    const { decks, cards } = state.game.definition;
    return decks.map((deck) => ({
      objectId: `deck-${deck.deckId}`,
      ...deck,
      cards: cards
        .filter((card) => card.deckId === deck.deckId)
        .map((card) => ({ objectId: `card-${card.cardId}`, ...card })),
    }));
  },
  deck: (deckId: DeckId) => (state: EditorState) =>
    state.game.definition.decks.find((d) => d.deckId === deckId),
  card: (cardId: CardId) => (state: EditorState) =>
    state.game.definition.cards.find((c) => c.cardId === cardId),
  actions: (state: EditorState) => state.game.definition.actions,
  action: (actionId: ActionId) => (state: EditorState) =>
    state.game.definition.actions.find((a) => a.actionId === actionId),
  reaction: (reactionId: ReactionId) => (state: EditorState) =>
    state.game.definition.reactions.find((r) => r.reactionId === reactionId),
  reactionsFor: (actionId: ActionId) => (state: EditorState) =>
    state.game.definition.reactions.filter((r) => r.actionId === actionId),
  propertiesFor: (entityId: EntityId) => (state: EditorState) =>
    state.game.definition.properties.filter((p) => p.entityId === entityId),
  cardsFor: (deckId: DeckId) => (state: EditorState) =>
    state.game.definition.cards.filter((p) => p.deckId === deckId),
};

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

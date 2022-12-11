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
import {
  createEntityReducerFactory,
  createId,
} from "../../../lib/createEntityReducers";
import type { MakePartial } from "../../../lib/MakePartial";

export const serializeObjectId = (objectId: EditorObjectId) =>
  JSON.stringify(objectId);

export const deserializeObjectId = (objectIdAsJson: string) =>
  JSON.parse(objectIdAsJson) as EditorObjectId;

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

export function deleteObject(objectId: EditorObjectId) {
  switch (objectId.type) {
    case "action":
      return editorActions.deleteAction(objectId.actionId);
    case "reaction":
      return editorActions.deleteReaction(objectId.reactionId);
    case "deck":
      return editorActions.deleteDeck(objectId.deckId);
    case "card":
      return editorActions.deleteCard(objectId.cardId);
  }
  throw new Error(`Unknown object type: ${objectId}`);
}

export const {
  reducer: editorReducer,
  getInitialState: getInitialEditorState,
} = editorSlice;

export const editorActions = {
  ...editorSlice.actions,
  deleteObject,
};

export const selectors = {
  selectedObject: (state: EditorState) => state.selectedObjectId,
  game: (state: EditorState) => state.game,
  decks: (state: EditorState) => state.game.definition.decks,
  decksAndCards: (state: EditorState) => {
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

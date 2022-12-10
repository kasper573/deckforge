import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import type {
  ActionId,
  Game,
  Reaction,
  ReactionId,
} from "../../../api/services/game/types";
import { unusableObjectProxy } from "../../../lib/unusableObjectProxy";

export type SelectedObject =
  | { type: "action"; actionId: ActionId }
  | { type: "reaction"; reactionId: ReactionId };

export interface EditorState {
  game: Game;
  selectedObject?: SelectedObject;
}

const initialState: EditorState = {
  game: unusableObjectProxy("A game has to be selected before using editor"),
};

type CreateAction<T> = PayloadAction<Omit<T, "id">>;
type UpdateAction<T> = PayloadAction<Partial<T>>;
const createId = <T>() => uuid() as T;

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
    createReaction(state, { payload }: CreateAction<Reaction>) {
      state.game.definition.reactions.push({
        ...payload,
        reactionId: createId(),
      });
    },
    updateReaction(
      state,
      { payload: { reactionId, ...changes } }: UpdateAction<Reaction>
    ) {
      const reaction = state.game.definition.reactions.find(
        (r) => r.reactionId === reactionId
      );
      if (!reaction) {
        throw new Error(`Reaction with id ${reactionId} not found`);
      }
      Object.assign(reaction, changes);
    },
    deleteReaction(
      {
        game: {
          definition: { reactions },
        },
      },
      { payload: id }: PayloadAction<ReactionId>
    ) {
      const index = reactions.findIndex((r) => r.reactionId === id);
      if (index === -1) {
        throw new Error(`Reaction with id ${id} not found`);
      }
      reactions.splice(index, 1);
    },
  },
});

export const {
  actions: editorActions,
  reducer: editorReducer,
  getInitialState: getInitialEditorState,
} = editorSlice;

export const selectors = {
  selectedObject: (state: EditorState) => state.selectedObject,
};

export const noUndoActionList: Array<keyof typeof editorActions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${name}`
);

import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { Game } from "../../../api/services/game/types";
import { unusableObjectProxy } from "../../../lib/unusableObjectProxy";

export interface EditorState {
  game: Game;
}

const initialState: EditorState = {
  game: unusableObjectProxy("A game has to be selected before using editor"),
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    newGameSelected: (state, { payload: newGame }: PayloadAction<Game>) => {
      state.game = newGame;
    },
    gameRenamed({ game }, { payload: newName }: PayloadAction<string>) {
      game.name = newName;
    },
  },
});

export const noUndoActionList: Array<keyof typeof editorSlice.actions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${name}`
);

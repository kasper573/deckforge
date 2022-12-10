import { createSlice } from "@reduxjs/toolkit";
import type { Game } from "../../../api/services/game/types";

export interface EditorState {
  game?: Game;
}

const initialState: EditorState = {};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {},
});

export const noUndoActionList: Array<keyof typeof editorSlice.actions> = [];

export const noUndoActions = noUndoActionList.map(
  (name) => `${editorSlice.name}/${name}`
);

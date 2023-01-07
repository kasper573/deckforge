import type { Reducer } from "redux";
import { combineReducers } from "redux";
import type { TypedUseSelectorHook } from "react-redux";
import {
  useStore as useReduxStore,
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";
import type { StateWithHistory } from "redux-undo";
import undoable, { excludeAction } from "redux-undo";
import { configureStore } from "@reduxjs/toolkit";
import { getInitialState, noUndoActions, reducer } from "./slice";
import type { EditorState } from "./types";

function createRootReducer(): Reducer<EditorRootState> {
  return combineReducers({
    editor: undoable(reducer, {
      filter: excludeAction(["@@INIT", ...noUndoActions]),
      limit: 30,
    }),
  });
}

const createRootState = (
  history: History,
  editorState: EditorState
): EditorRootState => ({
  editor: {
    past: [],
    present: editorState,
    future: [],
  },
});

export const editorStore = configureStore({
  reducer: createRootReducer(),
  preloadedState: createRootState(history, getInitialState()),
  middleware: (defaults) =>
    defaults({
      serializableCheck: false, // To allow superjson
    }),
});

export type EditorStore = typeof editorStore;
export type EditorDispatch = EditorStore["dispatch"];
export type EditorRootState = {
  editor: StateWithHistory<EditorState>;
};

export const useStore: () => EditorStore = useReduxStore;

export const useDispatch: () => EditorDispatch = useReduxDispatch;

export const useRootSelector: TypedUseSelectorHook<EditorRootState> =
  useReduxSelector;

export const useSelector: TypedUseSelectorHook<EditorState> = (
  selectFromAppState,
  equalityFn
) =>
  useRootSelector(
    (rootState) => selectFromAppState(rootState.editor.present),
    equalityFn
  );

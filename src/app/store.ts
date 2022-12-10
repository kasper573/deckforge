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
import type { EditorState } from "./features/editor/editorState";
import { editorReducer, noUndoActions } from "./features/editor/editorState";

export function createRootReducer(): Reducer<RootState> {
  return combineReducers({
    editor: undoable(editorReducer, {
      filter: excludeAction(["@@INIT", ...noUndoActions]),
      limit: 30,
    }),
  });
}

export const createRootState = (
  history: History,
  editorState: EditorState
): RootState => ({
  editor: {
    past: [],
    present: editorState,
    future: [],
  },
});

export function createStore(editorState: EditorState) {
  return configureStore({
    reducer: createRootReducer(),
    preloadedState: createRootState(history, editorState),
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = {
  editor: StateWithHistory<EditorState>;
};

export const useStore: () => AppStore = useReduxStore;

export const useDispatch: () => AppDispatch = useReduxDispatch;

export const useRootSelector: TypedUseSelectorHook<RootState> =
  useReduxSelector;

export const useSelector: TypedUseSelectorHook<EditorState> = (
  selectFromAppState,
  equalityFn
) =>
  useRootSelector(
    (rootState) => selectFromAppState(rootState.editor.present),
    equalityFn
  );

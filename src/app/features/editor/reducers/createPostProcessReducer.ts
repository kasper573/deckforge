import type { AnyAction } from "@reduxjs/toolkit";
import type { Reducer } from "redux";
import produce from "immer";
import type { EditorState } from "../types";
import { selectors } from "../selectors";
import { panelStorage, selectedObjectStorage } from "../localStorage";

export function createPostProcessReducer<Action extends AnyAction>(
  originalReducer: Reducer<EditorState, Action>,
  initialState: EditorState
) {
  return (state: EditorState = initialState, action: Action) => {
    const previousState = state;

    const fallbackObjectId = selectors.adjacentSelectedObject(state);

    let newState = originalReducer(state, action);

    // Ensure that the selected object still exists, fall back to the adjacent one
    // (this can happen on deletes, or when local storage selection contains old data)
    if (
      newState.game &&
      !selectors.objectById(newState.selectedObjectId)(newState)
    ) {
      const fallbackExist = selectors.objectById(fallbackObjectId)(newState);
      newState = produce(newState, (draft) => {
        draft.selectedObjectId = fallbackExist ? fallbackObjectId : undefined;
      });
    }

    // Persist layout and selection changes in local storage
    if (newState.selectedObjectId !== previousState.selectedObjectId) {
      selectedObjectStorage.save(newState.selectedObjectId);
    }
    if (newState.panelLayout !== previousState.panelLayout) {
      panelStorage.save(newState.panelLayout);
    }

    return newState;
  };
}

import { omit } from "lodash";
import type { EditorObjectId, EditorState } from "../types";
import { adjacent } from "../../../../lib/adjacent";

export function getObjectIdProperty<T extends EditorObjectId>(id: T) {
  type IdProperty = keyof Omit<T, "type">;
  const idProperty = Object.keys(omit(id, "type"))[0];
  return idProperty as IdProperty;
}

export function selectedList(
  state: EditorState,
  type = state.selectedObjectId?.type
) {
  switch (type) {
    case "event":
      return state.game?.definition.events;
    case "middleware":
      return state.game?.definition.middlewares;
    case "card":
      return state.game?.definition.cards;
    case "deck":
      return state.game?.definition.decks;
  }
}

export function objectById(id?: EditorObjectId) {
  return (state: EditorState) => {
    if (!id) {
      return;
    }
    const list = selectedList(state, id.type);
    if (list) {
      const prop = getObjectIdProperty(id);
      return (list as object[]).find((o) => o[prop] === id[prop]);
    }
  };
}

export function adjacentSelectedObject(
  state: EditorState
): EditorObjectId | undefined {
  const id = state.selectedObjectId;
  const list = selectedList(state);
  const obj = objectById(state.selectedObjectId)(state);
  const adj = adjacent(list, obj);
  if (id && adj) {
    const prop = getObjectIdProperty(id);
    return { ...id, [prop]: adj[prop] };
  }
}

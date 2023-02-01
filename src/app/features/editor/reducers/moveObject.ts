import type { PayloadAction } from "@reduxjs/toolkit";
import { original } from "@reduxjs/toolkit";
import type { EditorObjectId, EditorState } from "../types";
import { createObjectByIdPredicate, selectedList } from "../utils/objectUtils";

export function moveObject(
  state: EditorState,
  {
    payload: [movedObjectId, targetObjectId],
  }: PayloadAction<[EditorObjectId, EditorObjectId]>
) {
  if (!state.game) {
    return;
  }

  if (movedObjectId.type === "card" && targetObjectId.type === "deck") {
    const { cards, decks } = state.game.definition;
    const card = cards.find((c) => c.cardId === movedObjectId.cardId);
    const deck = decks.find((d) => d.deckId === targetObjectId.deckId);
    if (!card || !deck) {
      throw new Error("Unknown card or deck");
    }
    card.deckId = deck.deckId;
    return;
  }

  if (movedObjectId.type !== targetObjectId.type) {
    return; // Ignore attempts to move objects to different list types
  }

  const list = selectedList(state, movedObjectId.type);
  if (!list) {
    throw new Error(
      `Object type "${movedObjectId.type}" does not support moving`
    );
  }

  const idx1 =
    original(list)?.findIndex(createObjectByIdPredicate(movedObjectId)) ?? -1;
  const idx2 =
    original(list)?.findIndex(createObjectByIdPredicate(targetObjectId)) ?? -1;
  if (idx1 === -1 || idx2 === -1) {
    throw new Error("Could not find target or object to move");
  }

  const [moved] = list.splice(idx1, 1);
  list.splice(idx2, 0, moved);
}

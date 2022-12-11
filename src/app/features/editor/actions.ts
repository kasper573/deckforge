import { editorSlice } from "./slice";
import type { EditorObjectId } from "./types";

function deleteObject(objectId: EditorObjectId) {
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

function renameObject(objectId: EditorObjectId, name: string) {
  switch (objectId.type) {
    case "action":
      return editorActions.updateAction({ ...objectId, name });
    case "reaction":
      return editorActions.updateReaction({ ...objectId, name });
    case "deck":
      return editorActions.updateDeck({ ...objectId, name });
    case "card":
      return editorActions.updateCard({ ...objectId, name });
  }
  throw new Error(`Unknown object type: ${objectId}`);
}

export const editorActions = {
  ...editorSlice.actions,
  deleteObject,
  renameObject,
};

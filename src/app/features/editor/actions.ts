import type { Action } from "redux";
import { actions } from "./slice";
import type { EditorObjectId } from "./types";

function deleteObject(objectId: EditorObjectId): Action {
  switch (objectId.type) {
    case "action":
      return editorActions.deleteAction(objectId.actionId);
    case "deck":
      return editorActions.deleteDeck(objectId.deckId);
    case "card":
      return editorActions.deleteCard(objectId.cardId);
    case "property":
      return editorActions.deleteProperty(objectId.propertyId);
  }
}

function renameObject(objectId: EditorObjectId, name: string): Action {
  switch (objectId.type) {
    case "action":
      return editorActions.updateAction({ ...objectId, name });
    case "deck":
      return editorActions.updateDeck({ ...objectId, name });
    case "card":
      return editorActions.updateCard({ ...objectId, name });
    case "property":
      return editorActions.updateProperty({
        propertyId: objectId.propertyId,
        name,
      });
  }
}

export const editorActions = {
  ...actions,
  deleteObject,
  renameObject,
};

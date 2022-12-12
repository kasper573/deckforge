import type {
  ActionId,
  CardId,
  DeckId,
  Game,
  PropertyId,
  ReactionId,
} from "../../../api/services/game/types";

export type EditorObjectId =
  | { type: "action"; actionId: ActionId }
  | { type: "reaction"; reactionId: ReactionId }
  | { type: "deck"; deckId: DeckId }
  | { type: "card"; cardId: CardId }
  | { type: "property"; propertyId: PropertyId };

export interface EditorState {
  game?: Game;
  selectedObjectId?: EditorObjectId;
}

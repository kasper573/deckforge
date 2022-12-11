import type {
  ActionId,
  CardId,
  DeckId,
  Game,
  ReactionId,
} from "../../../api/services/game/types";

export type EditorObjectId =
  | { type: "action"; actionId: ActionId }
  | { type: "reaction"; reactionId: ReactionId }
  | { type: "deck"; deckId: DeckId }
  | { type: "card"; cardId: CardId };

export interface EditorState {
  game: Game;
  selectedObjectId?: EditorObjectId;
}

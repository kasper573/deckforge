import type { MosaicNode } from "react-mosaic-component";
import type {
  ActionId,
  CardId,
  DeckId,
  Game,
  PropertyId,
  ReactionId,
} from "../../../api/services/game/types";
import type { PanelId } from "./panels/definition";

export type EditorObjectId =
  | { type: "action"; actionId: ActionId }
  | { type: "reaction"; reactionId: ReactionId }
  | { type: "deck"; deckId: DeckId }
  | { type: "card"; cardId: CardId }
  | { type: "property"; propertyId: PropertyId };

export interface EditorState {
  game?: Game;
  selectedObjectId?: EditorObjectId;
  panelLayout: MosaicNode<PanelId>;
}

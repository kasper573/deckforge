import type { MosaicNode } from "react-mosaic-component";
import type { ZodType } from "zod";
import { z } from "zod";
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
  panelLayout: MosaicNode<PanelId>;
}

export type PanelId = z.infer<typeof panelIdType>;
export const panelIdType = z.enum([
  "code",
  "decks",
  "events",
  "cardProperties",
  "playerProperties",
  "inspector",
]);

export type PanelLayout = MosaicNode<PanelId>;
export const panelLayoutType: ZodType<PanelLayout> = panelIdType.or(
  z.object({
    direction: z.enum(["row", "column"]),
    first: z.lazy(() => panelLayoutType),
    second: z.lazy(() => panelLayoutType),
    splitPercentage: z.number().optional(),
  })
);

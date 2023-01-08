import type { MosaicNode } from "react-mosaic-component";
import type { ZodType } from "zod";
import { z } from "zod";
import type {
  EventId,
  CardId,
  DeckId,
  Game,
  PropertyId,
  MiddlewareId,
} from "../../../api/services/game/types";
import { zodNominalString } from "../../../lib/zod-extensions/zodNominalString";

export const editorObjectIdType = z
  .object({
    type: z.literal("event"),
    eventId: zodNominalString<EventId>(),
  })
  .or(
    z.object({
      type: z.literal("middleware"),
      middlewareId: zodNominalString<MiddlewareId>(),
    })
  )
  .or(
    z.object({
      type: z.literal("deck"),
      deckId: zodNominalString<DeckId>(),
    })
  )
  .or(
    z.object({
      type: z.literal("card"),
      cardId: zodNominalString<CardId>(),
    })
  )
  .or(
    z.object({
      type: z.literal("property"),
      propertyId: zodNominalString<PropertyId>(),
    })
  );

export type EditorObjectId = z.infer<typeof editorObjectIdType>;

export interface EditorState {
  game?: Game;
  selectedObjectId?: EditorObjectId;
  panelLayout?: PanelLayout;
}

export type PanelId = z.infer<typeof panelIdType>;
export const panelIdType = z.enum([
  "code",
  "decks",
  "events",
  "middlewares",
  "cardProperties",
  "playerProperties",
  "inspector",
  "runtime",
  "logs",
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

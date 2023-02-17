import type { MosaicNode } from "react-mosaic-component";
import type { ZodType } from "zod";
import { z } from "zod";
import type { Game } from "../../../api/services/game/types";
import {
  cardIdType,
  deckIdType,
  eventIdType,
  propertyIdType,
  reducerIdType,
} from "../../../api/services/game/types";
import type { LogEntry } from "./components/Log/types";

export const editorObjectIdType = z
  .object({
    type: z.literal("event"),
    eventId: eventIdType,
  })
  .or(
    z.object({
      type: z.literal("reducer"),
      reducerId: reducerIdType,
    })
  )
  .or(
    z.object({
      type: z.literal("deck"),
      deckId: deckIdType,
    })
  )
  .or(
    z.object({
      type: z.literal("card"),
      cardId: cardIdType,
    })
  )
  .or(
    z.object({
      type: z.literal("property"),
      propertyId: propertyIdType,
    })
  );

export type EditorObjectId = z.infer<typeof editorObjectIdType>;

export type EditorSyncState = "synced" | "dirty" | "uploading" | "downloading";

export interface EditorState {
  game?: Game;
  syncState: EditorSyncState;
  selectedObjectId?: EditorObjectId;
  panelLayout?: PanelLayout;
  logs: LogEntry[];
}

export type PanelId = z.infer<typeof panelIdType>;
export const panelIdType = z.enum([
  "code",
  "decks",
  "events",
  "reducers",
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
    splitPercentage: z
      .number()
      .nullish()
      // Have to transform nulls to undefined because react-mosaic-component
      // has poor type definitions and in fact uses nulls in runtime
      .transform((v) => (v === null ? undefined : v)) as ZodType<
      number | undefined
    >,
  })
);

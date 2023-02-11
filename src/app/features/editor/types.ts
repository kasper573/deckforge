import type { MosaicNode } from "react-mosaic-component";
import type { ZodType } from "zod";
import { z } from "zod";
import type { Game } from "../../../api/services/game/types";
import {
  cardIdType,
  deckIdType,
  eventIdType,
  reducerIdType,
  propertyIdType,
} from "../../../api/services/game/types";

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

export interface LogEntry {
  id: string;
  content: LogContent[];
}

export const logIdentifierSymbol = Symbol("logIdentifier");
export const logIdentifier = (
  value: LogValue,
  options: Pick<LogIdentifier, "name" | "color"> = {}
): LogIdentifier => ({
  [logIdentifierSymbol]: true,
  value,
  ...options,
});

export type LogValue = unknown;
export type LogIdentifier = {
  [logIdentifierSymbol]: true;
  value: LogValue;
  name?: string;
  color?: string;
};
export type LogContent = LogValue | LogIdentifier;
export const isLogIdentifier = (value: unknown): value is LogIdentifier =>
  typeof value === "object" && value !== null && logIdentifierSymbol in value;

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

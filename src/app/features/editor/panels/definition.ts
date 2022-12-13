import { z } from "zod";
import type { ComponentType } from "react";
import type { MosaicBranch } from "react-mosaic-component";
import { DecksPanel } from "./DecksPanel";
import { EventsPanel } from "./EventsPanel";
import { CodePanel } from "./CodePanel";
import { InspectorPanel } from "./InspectorPanel";
import { CardPropertiesPanel, PlayerPropertiesPanel } from "./PropertiesPanel";

export type PanelId = z.infer<typeof panelIdType>;
export type PanelProps = { path: MosaicBranch[] };

export const panelIdType = z.enum([
  "code",
  "decks",
  "events",
  "cardProperties",
  "playerProperties",
  "inspector",
]);

export const panelsDefinition: Record<PanelId, ComponentType<PanelProps>> = {
  code: CodePanel,
  decks: DecksPanel,
  events: EventsPanel,
  cardProperties: CardPropertiesPanel,
  playerProperties: PlayerPropertiesPanel,
  inspector: InspectorPanel,
};

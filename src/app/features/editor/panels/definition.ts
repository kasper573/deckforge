import { z } from "zod";
import type { ComponentType } from "react";
import type { MosaicBranch } from "react-mosaic-component";
import { DecksPanel } from "./DecksPanel";
import { EventsPanel } from "./EventsPanel";
import { CodePanel } from "./CodePanel";
import { InspectorPanel } from "./InspectorPanel";
import { PropertiesPanel } from "./PropertiesPanel";

export type PanelId = z.infer<typeof panelIdType>;

export const panelIdType = z.enum([
  "code",
  "decks",
  "events",
  "properties",
  "inspector",
]);

export const panelsDefinition: Record<
  PanelId,
  ComponentType<{ path: MosaicBranch[] }>
> = {
  code: CodePanel,
  decks: DecksPanel,
  events: EventsPanel,
  properties: PropertiesPanel,
  inspector: InspectorPanel,
};

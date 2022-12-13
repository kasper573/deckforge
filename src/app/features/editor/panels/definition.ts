import { z } from "zod";
import type { ComponentType } from "react";
import type { MosaicBranch } from "react-mosaic-component";
import { DecksPanel } from "./DecksPanel";
import { EventsPanel } from "./EventsPanel";
import { CodePanel } from "./CodePanel";
import { InspectorPanel } from "./InspectorPanel";
import { CardPropertiesPanel, PlayerPropertiesPanel } from "./PropertiesPanel";

export type PanelId = z.infer<typeof panelIdType>;
export type PanelProps = { path: MosaicBranch[]; title: string };
export interface PanelDefinition {
  component: ComponentType<PanelProps>;
  title: string;
}

export const panelIdType = z.enum([
  "code",
  "decks",
  "events",
  "cardProperties",
  "playerProperties",
  "inspector",
]);

export const panelsDefinition: Record<PanelId, PanelDefinition> = {
  code: { component: CodePanel, title: "Code" },
  decks: { component: DecksPanel, title: "Decks" },
  events: { component: EventsPanel, title: "Events" },
  cardProperties: { component: CardPropertiesPanel, title: "Card Properties" },
  playerProperties: {
    component: PlayerPropertiesPanel,
    title: "Player Properties",
  },
  inspector: { component: InspectorPanel, title: "Inspector" },
};

export const panelDefinitionList = Object.entries(panelsDefinition).map(
  ([id, def]) => ({ id: id as PanelId, ...def })
);

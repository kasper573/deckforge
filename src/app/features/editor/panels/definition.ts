import type { ComponentType } from "react";
import type { MosaicBranch } from "react-mosaic-component";
import type { PanelId } from "../types";
import { DecksPanel } from "./DecksPanel";
import { EventsPanel } from "./EventsPanel";
import { CodePanel } from "./CodePanel/CodePanel";
import { InspectorPanel } from "./InspectorPanel/InspectorPanel";
import { CardPropertiesPanel, PlayerPropertiesPanel } from "./PropertiesPanel";
import { RuntimePanel } from "./RuntimePanel";
import { MiddlewaresPanel } from "./MiddlewaresPanel";
import { LogsPanel } from "./LogsPanel";

export type PanelProps = { path: MosaicBranch[]; title: string };

export interface PanelDefinition {
  component: ComponentType<PanelProps>;
  title: string;
}

export const panelsDefinition: Record<PanelId, PanelDefinition> = {
  runtime: { component: RuntimePanel, title: "Runtime" },
  code: { component: CodePanel, title: "Code" },
  inspector: { component: InspectorPanel, title: "Inspector" },
  decks: { component: DecksPanel, title: "Decks" },
  events: { component: EventsPanel, title: "Events" },
  middlewares: { component: MiddlewaresPanel, title: "Middlewares" },
  cardProperties: { component: CardPropertiesPanel, title: "Card Properties" },
  playerProperties: {
    component: PlayerPropertiesPanel,
    title: "Player Properties",
  },
  logs: { component: LogsPanel, title: "Logs" },
};

export const panelDefinitionList = Object.entries(panelsDefinition).map(
  ([id, def]) => ({ id: id as PanelId, ...def })
);

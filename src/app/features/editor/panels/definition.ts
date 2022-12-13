import { z } from "zod";
import type { ComponentType } from "react";
import type { MosaicBranch } from "react-mosaic-component";
import { CodePanel } from "./CodePanel";
import { ProjectPanel } from "./ProjectPanel";
import { InspectorPanel } from "./InspectorPanel";

export type PanelId = z.infer<typeof panelIdType>;

export const panelIdType = z.enum(["code", "project", "inspector"]);

export const panelsDefinition: Record<
  PanelId,
  ComponentType<{ path: MosaicBranch[] }>
> = {
  code: CodePanel,
  project: ProjectPanel,
  inspector: InspectorPanel,
};

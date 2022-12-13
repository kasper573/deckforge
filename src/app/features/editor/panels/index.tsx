import { styled } from "@mui/material/styles";
import type { MosaicBranch } from "react-mosaic-component";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import type { ComponentProps, ComponentType } from "react";
import Paper from "@mui/material/Paper";
import { z } from "zod";
import { CodePanel } from "./CodePanel";
import { ProjectPanel } from "./ProjectPanel";
import { InspectorPanel } from "./InspectorPanel";

export type PanelId = z.infer<typeof panelIdType>;
export const panelIdType = z.enum(["code", "project", "inspector"]);

export const panels: Record<
  PanelId,
  ComponentType<{ path: MosaicBranch[] }>
> = {
  code: CodePanel,
  project: ProjectPanel,
  inspector: InspectorPanel,
};

export const PanelContainer = styled(Mosaic<PanelId>)`
  flex: 1;
  && {
    background: transparent;
    .mosaic-window {
      border-radius: ${({ theme }) => theme.shape.borderRadius}px;
    }
    .mosaic-window-toolbar {
      background: ${({ theme }) => theme.palette.background.paper};
      border-radius: 0;
      box-shadow: none;
    }
    .mosaic-window-title {
      ${({ theme }) => theme.typography.caption}
    }
    .mosaic-window-body {
      background: transparent;
    }
  }
`;

export function Panel({
  children,
  paperProps,
  ...props
}: ComponentProps<typeof MosaicWindow<PanelId>> & {
  paperProps?: ComponentProps<typeof PanelPaper>;
}) {
  return (
    <MosaicWindow<PanelId> toolbarControls={[]} {...props}>
      <PanelPaper {...paperProps}>{children}</PanelPaper>
    </MosaicWindow>
  );
}

const PanelPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

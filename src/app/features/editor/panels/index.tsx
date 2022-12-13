import { styled } from "@mui/material/styles";
import { Mosaic, MosaicWindow } from "react-mosaic-component";
import type { ComponentProps } from "react";
import Paper from "@mui/material/Paper";
import { CodePanel } from "./CodePanel";
import { ProjectPanel } from "./ProjectPanel";
import { InspectorPanel } from "./InspectorPanel";

export type PanelId = keyof typeof panels;

export const panels = {
  code: CodePanel,
  project: ProjectPanel,
  inspector: InspectorPanel,
};

export const defaultPanelLayout = {
  direction: "row",
  first: "code",
  second: {
    direction: "column",
    first: "inspector",
    second: "project",
    splitPercentage: 20,
  },
  splitPercentage: 70,
} as const;

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

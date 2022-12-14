import type { ComponentProps } from "react";
import { MosaicWindow } from "react-mosaic-component";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import type { PanelId } from "../types";
import { PanelControls } from "./PanelControls";

export function Panel({
  children,
  sx,
  style,
  className,
  onContextMenu,
  toolbarControls = <PanelControls />,
  ...props
}: ComponentProps<typeof MosaicWindow<PanelId>> &
  Pick<
    ComponentProps<typeof PanelPaper>,
    "sx" | "style" | "className" | "onContextMenu"
  >) {
  return (
    <MosaicWindow<PanelId> toolbarControls={toolbarControls} {...props}>
      <PanelPaper {...{ sx, style, className, onContextMenu }}>
        {children}
      </PanelPaper>
    </MosaicWindow>
  );
}

const PanelPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
`;

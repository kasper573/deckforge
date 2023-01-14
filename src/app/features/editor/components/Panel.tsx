import type { ComponentProps, ReactNode } from "react";
import { MosaicWindow } from "react-mosaic-component";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import type { PanelId } from "../types";
import { PanelControls } from "./PanelControls";

export interface PanelProps
  extends Omit<ComponentProps<typeof MosaicWindow<PanelId>>, "title">,
    Pick<
      ComponentProps<typeof PanelPaper>,
      "sx" | "style" | "className" | "onContextMenu"
    > {
  title: ReactNode;
  paperRef?: ComponentProps<typeof PanelPaper>["ref"];
}

export function Panel({
  children,
  title,
  sx,
  style,
  className,
  onContextMenu,
  paperRef,
  toolbarControls = <PanelControls />,
  ...props
}: PanelProps) {
  return (
    <MosaicWindow<PanelId>
      title={title as unknown as string} // MosaicWindow title actually supports react nodes but is typed incorrectly
      toolbarControls={toolbarControls}
      {...props}
    >
      <PanelPaper ref={paperRef} {...{ sx, style, onContextMenu }}>
        {children}
        <Overlay className={className} />
      </PanelPaper>
    </MosaicWindow>
  );
}

const Overlay = styled("div")`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const PanelPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  position: relative;
`;

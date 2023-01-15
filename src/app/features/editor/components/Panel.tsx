import type { ComponentProps, ReactNode } from "react";
import { MosaicWindow } from "react-mosaic-component";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { forwardRef } from "react";
import type { PanelId } from "../types";
import { PanelControls } from "./PanelControls";

export interface PanelProps
  extends Omit<ComponentProps<typeof MosaicWindow<PanelId>>, "title">,
    Pick<
      ComponentProps<typeof PanelPaper>,
      "sx" | "className" | "style" | "onContextMenu"
    > {
  title: ReactNode;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  {
    children,
    title,
    sx,
    style,
    className,
    onContextMenu,
    toolbarControls = <PanelControls />,
    ...props
  },
  ref
) {
  return (
    <MosaicWindow<PanelId>
      title={title as unknown as string} // MosaicWindow title actually supports react nodes but is typed incorrectly
      toolbarControls={toolbarControls}
      {...props}
    >
      <PanelPaper
        {...{
          ref,
          sx,
          style,
          className,
          onContextMenu,
        }}
      >
        {children}
      </PanelPaper>
    </MosaicWindow>
  );
});

const PanelPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  position: relative;
`;

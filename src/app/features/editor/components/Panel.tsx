import type { ComponentProps } from "react";
import { MosaicWindow } from "react-mosaic-component";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import type { PanelId } from "../panels/definition";

export function Panel({
  children,
  sx,
  style,
  className,
  ...props
}: ComponentProps<typeof MosaicWindow<PanelId>> &
  Pick<ComponentProps<typeof PanelPaper>, "sx" | "style" | "className">) {
  return (
    <MosaicWindow<PanelId> toolbarControls={[]} {...props}>
      <PanelPaper {...{ sx, style, className }}>{children}</PanelPaper>
    </MosaicWindow>
  );
}

const PanelPaper = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

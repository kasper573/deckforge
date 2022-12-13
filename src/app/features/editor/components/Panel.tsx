import type { ComponentProps } from "react";
import { MosaicWindow } from "react-mosaic-component";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import type { PanelId } from "../panels/definition";

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

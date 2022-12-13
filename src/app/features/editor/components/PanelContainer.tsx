import { styled } from "@mui/material/styles";
import { Mosaic } from "react-mosaic-component";
import type { PanelId } from "../types";

export const PanelContainer = styled(Mosaic<PanelId>)`
  flex: 1; // Fill the entire page
  // Integrate with material-ui
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

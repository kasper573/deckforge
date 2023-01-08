import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Yard from "@mui/icons-material/Yard";
import { Panel } from "../components/Panel";
import { PanelControls } from "../components/PanelControls";
import type { PanelProps } from "./definition";

export function LogsPanel(props: PanelProps) {
  function clear() {}

  return (
    <Panel
      toolbarControls={
        <PanelControls>
          <Tooltip title="Clear logs">
            <IconButton size="small" onClick={clear}>
              <Yard />
            </IconButton>
          </Tooltip>
        </PanelControls>
      }
      {...props}
    ></Panel>
  );
}

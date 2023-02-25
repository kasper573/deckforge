import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useLayoutEffect, useRef } from "react";
import { Panel } from "../components/Panel";
import { PanelControls } from "../components/PanelControls";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Delete } from "../../../components/icons";
import { LogList } from "../../log/components/LogList";
import type { PanelProps } from "./definition";

export function LogsPanel(props: PanelProps) {
  const logs = useSelector(selectors.logs);
  const { clearLogs } = useActions(editorActions);
  const paperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (paperRef.current) {
      paperRef.current.scrollTo(0, paperRef.current.scrollHeight);
    }
  }, [logs]);

  return (
    <Panel
      ref={paperRef}
      toolbarControls={
        <PanelControls>
          <Tooltip title="Clear logs">
            <IconButton size="small" onClick={() => clearLogs()}>
              <Delete />
            </IconButton>
          </Tooltip>
        </PanelControls>
      }
      {...props}
    >
      {logs.length ? (
        <LogList entries={logs} />
      ) : (
        <PanelEmptyState>
          Events and errors will be displayed here as they happen
        </PanelEmptyState>
      )}
    </Panel>
  );
}

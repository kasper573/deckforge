import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import { ObjectInspector } from "react-inspector";
import { useLayoutEffect, useRef } from "react";
import { Panel } from "../components/Panel";
import { PanelControls } from "../components/PanelControls";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import type { LogEntry } from "../types";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Delete } from "../../../components/icons";
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
        <List>
          {logs.map((entry) => (
            <LogListItem key={entry.id} entry={entry} />
          ))}
        </List>
      ) : (
        <PanelEmptyState>
          Events and errors will be displayed here as they happen
        </PanelEmptyState>
      )}
    </Panel>
  );
}

function LogListItem({ entry }: { entry: LogEntry }) {
  return (
    <ListItem>
      {entry.content.map((value, index) => (
        <LogValue key={index} value={value} />
      ))}
    </ListItem>
  );
}

function LogValue({ value }: { value: unknown }) {
  switch (typeof value) {
    case "undefined":
    case "number":
    case "boolean":
      return <Highlighted>{value}</Highlighted>;
    case "object":
      if (value === null) {
        return <Highlighted>null</Highlighted>;
      }
      if (value instanceof Error) {
        return <Normal>{String(value)}</Normal>;
      }
      return <ObjectInspector data={value} theme="chromeDark" />;
    default:
      return <Normal>{String(value)}</Normal>;
  }
}

const Value = styled("span")`
  & + & {
    padding-left: 4px;
  }
`;

const Highlighted = styled(Value)`
  color: ${(p) => p.theme.palette.secondary.main};
`;
const Normal = styled(Value)`
  color: ${(p) => p.theme.palette.text.secondary};
`;

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Yard from "@mui/icons-material/Yard";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import { ObjectInspector } from "react-inspector";
import { Panel } from "../components/Panel";
import { PanelControls } from "../components/PanelControls";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import type { LogEntry } from "../types";
import { useActions } from "../../../../lib/useActions";
import { editorActions } from "../actions";
import type { PanelProps } from "./definition";

export function LogsPanel(props: PanelProps) {
  const logs = useSelector(selectors.logs);
  const { clearLogs } = useActions(editorActions);

  return (
    <Panel
      toolbarControls={
        <PanelControls>
          <Tooltip title="Clear logs">
            <IconButton size="small" onClick={() => clearLogs()}>
              <Yard />
            </IconButton>
          </Tooltip>
        </PanelControls>
      }
      {...props}
    >
      <List>
        {logs.map((entry) => (
          <LogListItem key={entry.id} entry={entry} />
        ))}
      </List>
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

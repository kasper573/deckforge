import MenuItem from "@mui/material/MenuItem";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { useMenu } from "../../../hooks/useMenu";
import { Tree } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { useConfirmDelete, usePromptCreate, usePromptRename } from "../hooks";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import { ObjectIcon } from "../components/ObjectIcon";
import type { PanelProps } from "./definition";

export function EventsPanel(props: PanelProps) {
  const events = useSelector(selectors.events);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const promptCreate = usePromptCreate();
  const { createEvent, selectObject } = useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);

  const promptCreateEvent = () =>
    promptCreate("event", (name) => createEvent({ name }));

  const openContextMenu = useMenu([
    <MenuItem onClick={promptCreateEvent}>New action</MenuItem>,
  ]);

  return (
    <Panel sx={{ py: 1 }} onContextMenu={openContextMenu} {...props}>
      <Tree
        selected={selectedObjectId}
        onSelectedChanged={selectObject}
        items={events.map((action) => ({
          nodeId: action.objectId,
          label: action.name,
          icon: <ObjectIcon type="event" />,
          onDoubleClick: () => promptRename(action),
          contextMenu: [
            <MenuItem onClick={() => promptRename(action)}>Rename</MenuItem>,
            <MenuItem onClick={() => confirmDelete(action)}>Delete</MenuItem>,
          ],
        }))}
      />
      {events.length === 0 && (
        <PanelEmptyState>This game has no events</PanelEmptyState>
      )}
    </Panel>
  );
}

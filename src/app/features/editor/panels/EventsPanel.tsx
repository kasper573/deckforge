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
import { propertyValue } from "../../../../api/services/game/types";
import { ZodPicker } from "../../../controls/ZodPicker";
import type { PanelProps } from "./definition";

export function EventsPanel(props: PanelProps) {
  const events = useSelector(selectors.events);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const promptCreate = usePromptCreate();
  const { createEvent, updateEvent, selectObject } = useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);

  const promptCreateEvent = () =>
    promptCreate("event", (name) => createEvent({ name }));

  const openContextMenu = useMenu([
    <MenuItem onClick={promptCreateEvent}>New event</MenuItem>,
  ]);

  return (
    <Panel sx={{ py: 1 }} onContextMenu={openContextMenu} {...props}>
      <Tree
        selected={selectedObjectId}
        onSelectedChanged={selectObject}
        items={events.map((event) => ({
          nodeId: event.objectId,
          label: event.name,
          action: (
            <ZodPicker
              schema={propertyValue.serializedType}
              value={event.inputType}
              onChange={(inputType) => updateEvent({ ...event, inputType })}
            />
          ),
          icon: <ObjectIcon type="event" />,
          onDoubleClick: () => promptRename(event),
          contextMenu: [
            <MenuItem onClick={() => promptRename(event)}>Rename</MenuItem>,
            <MenuItem onClick={() => confirmDelete(event)}>Delete</MenuItem>,
          ],
        }))}
      />
      {events.length === 0 && (
        <PanelEmptyState>This game has no events</PanelEmptyState>
      )}
    </Panel>
  );
}

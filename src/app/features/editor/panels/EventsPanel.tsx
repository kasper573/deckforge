import MenuItem from "@mui/material/MenuItem";
import { ZodObject } from "zod";
import Tooltip from "@mui/material/Tooltip";
import { memo } from "react";
import { useSelector } from "../store";
import { useActions } from "../../../../lib/useActions";
import { useMenu } from "../../../hooks/useMenu";
import { Tree } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import { ObjectIcon } from "../components/ObjectIcon";
import { PropertyTypePicker } from "../../../controls/PropertyTypePicker";
import type { Event } from "../../../../api/services/game/types";
import type { RuntimeDefinition } from "../../compiler/types";
import { defined } from "../../../../lib/ts-extensions/defined";
import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { usePromptCreate, usePromptRename } from "../hooks/usePromptCrud";
import type { PanelProps } from "./definition";

export const EventsPanel = memo(function EventsPanel(props: PanelProps) {
  const events = useSelector(selectors.events);
  const builtinDef = useSelector(selectors.builtinDefinition);
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
    <Panel
      className="tour1"
      sx={{ py: 1 }}
      onContextMenu={openContextMenu}
      {...props}
    >
      <Tree
        selected={selectedObjectId}
        onSelectedChanged={selectObject}
        items={events.map((event) => {
          const isEditable = isEventEditable(event, builtinDef);
          return {
            nodeId: event.objectId,
            label: event.name,
            action: (
              <Tooltip
                title={
                  isEditable
                    ? undefined
                    : "This is a required event and may not be edited"
                }
              >
                <div>
                  <PropertyTypePicker
                    disabled={!isEditable}
                    value={event.inputType}
                    onChange={(inputType) =>
                      updateEvent({ ...event, inputType })
                    }
                    title={`Edit input type of event "${event.name}"`}
                  />
                </div>
              </Tooltip>
            ),
            icon: <ObjectIcon type="event" />,
            onDoubleClick: isEditable ? () => promptRename(event) : undefined,
            contextMenu: defined([
              isEditable && (
                <MenuItem onClick={() => promptRename(event)}>Rename</MenuItem>
              ),
              isEditable && (
                <MenuItem onClick={() => confirmDelete(event)}>Delete</MenuItem>
              ),
            ]),
          };
        })}
      />
      {events.length === 0 && (
        <PanelEmptyState>This game has no events</PanelEmptyState>
      )}
    </Panel>
  );
});

function isEventEditable(event: Event, builtinDef?: RuntimeDefinition) {
  const type = builtinDef?.actions;
  return (
    type &&
    !(type instanceof ZodObject && Object.keys(type.shape).includes(event.name))
  );
}

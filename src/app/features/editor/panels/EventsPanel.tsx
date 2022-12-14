import MenuItem from "@mui/material/MenuItem";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { useMenu } from "../../../hooks/useMenu";
import { Tree } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { useConfirmDelete, usePromptCreate, usePromptRename } from "../hooks";
import type { ActionId } from "../../../../api/services/game/types";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import type { PanelProps } from "./definition";

export function EventsPanel(props: PanelProps) {
  const events = useSelector(selectors.events);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const promptCreate = usePromptCreate();
  const { createAction, createReaction, selectObject } =
    useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);

  const promptCreateAction = () =>
    promptCreate("action", (name) => createAction({ name }));
  const promptCreateReaction = (actionId: ActionId) =>
    promptCreate("reaction", (name) => createReaction({ name, actionId }));

  const openContextMenu = useMenu([
    <MenuItem onClick={promptCreateAction}>New action</MenuItem>,
  ]);

  return (
    <Panel onContextMenu={openContextMenu} {...props}>
      <Tree
        selected={selectedObjectId}
        onSelectedChanged={selectObject}
        items={events.map((action) => ({
          nodeId: action.objectId,
          label: action.name,
          contextMenu: [
            <MenuItem onClick={() => promptRename(action)}>Rename</MenuItem>,
            <MenuItem onClick={() => promptCreateReaction(action.actionId)}>
              New reaction
            </MenuItem>,
            <MenuItem onClick={() => confirmDelete(action)}>Delete</MenuItem>,
          ],
          children: action.reactions.map((reaction) => ({
            nodeId: reaction.objectId,
            label: reaction.name,
            contextMenu: [
              <MenuItem onClick={() => promptRename(reaction)}>
                Rename
              </MenuItem>,
              <MenuItem onClick={() => confirmDelete(reaction)}>
                Delete
              </MenuItem>,
            ],
          })),
        }))}
      />
      {events.length === 0 && (
        <PanelEmptyState>This game has no events</PanelEmptyState>
      )}
    </Panel>
  );
}

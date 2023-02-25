import MenuItem from "@mui/material/MenuItem";
import { useSelector } from "../store";
import { useActions } from "../../../../lib/useActions";
import { useMenu } from "../../../hooks/useMenu";
import { Tree } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { Panel } from "../components/Panel";
import { ObjectIcon } from "../components/ObjectIcon";
import { useConfirmDelete } from "../hooks/useConfirmDelete";
import { usePromptCreate, usePromptRename } from "../hooks/usePromptCrud";
import type { PanelProps } from "./definition";

export function ReducersPanel(props: PanelProps) {
  const reducers = useSelector(selectors.reducers);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const promptCreate = usePromptCreate();
  const { createReducer, moveObject, selectObject } = useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObjectId);

  const promptCreateReducer = () =>
    promptCreate("reducer", (name) => createReducer({ name }));

  const openContextMenu = useMenu([
    <MenuItem onClick={promptCreateReducer}>New reducer</MenuItem>,
  ]);

  return (
    <Panel sx={{ py: 1 }} onContextMenu={openContextMenu} {...props}>
      <Tree
        selected={selectedObjectId}
        onSelectedChanged={selectObject}
        onItemMoved={moveObject}
        items={reducers.map((reducer) => ({
          nodeId: reducer.objectId,
          label: reducer.name,
          icon: <ObjectIcon type="reducer" />,
          onDoubleClick: () => promptRename(reducer),
          contextMenu: [
            <MenuItem onClick={() => promptRename(reducer)}>Rename</MenuItem>,
            <MenuItem onClick={() => confirmDelete(reducer)}>Delete</MenuItem>,
          ],
        }))}
      />
      {reducers.length === 0 && (
        <PanelEmptyState>This game has no reducers</PanelEmptyState>
      )}
    </Panel>
  );
}

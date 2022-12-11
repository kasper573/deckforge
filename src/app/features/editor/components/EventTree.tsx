import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import { useSelector } from "../../../store";
import { useActions } from "../../../../lib/useActions";
import { useMenu } from "../../../hooks/useMenu";
import { Tree, TreeItem } from "../../../components/Tree";
import { editorActions } from "../actions";
import { selectors } from "../selectors";
import { useConfirmDelete, usePromptRename } from "../hooks";

export function EventTree() {
  const events = useSelector(selectors.events);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const { createAction, createReaction, selectObject } =
    useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);
  const [openContextMenu, contextMenu] = useMenu([
    <MenuItem onClick={() => createAction({})}>New action</MenuItem>,
  ]);

  return (
    <Box onContextMenu={openContextMenu} sx={{ flex: 1 }}>
      <Tree selected={selectedObjectId} onSelectedChanged={selectObject}>
        {events.map((action, index) => (
          <TreeItem
            key={index}
            nodeId={action.objectId}
            label={action.name}
            contextMenu={[
              <MenuItem onClick={() => promptRename(action)}>Rename</MenuItem>,
              <MenuItem
                onClick={() => createReaction({ actionId: action.actionId })}
              >
                New reaction
              </MenuItem>,
              <MenuItem onClick={() => confirmDelete(action)}>Delete</MenuItem>,
            ]}
          >
            {action.reactions.map((reaction, index) => (
              <TreeItem
                key={index}
                nodeId={reaction.objectId}
                label={reaction.name}
                contextMenu={[
                  <MenuItem onClick={() => promptRename(reaction)}>
                    Rename
                  </MenuItem>,
                  <MenuItem onClick={() => confirmDelete(reaction)}>
                    Delete
                  </MenuItem>,
                ]}
              />
            ))}
          </TreeItem>
        ))}
      </Tree>
      {contextMenu}
    </Box>
  );
}

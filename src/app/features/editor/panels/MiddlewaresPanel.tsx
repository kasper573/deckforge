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

export function MiddlewaresPanel(props: PanelProps) {
  const middlewares = useSelector(selectors.middlewares);
  const confirmDelete = useConfirmDelete();
  const promptRename = usePromptRename();
  const promptCreate = usePromptCreate();
  const { createMiddleware, updateMiddleware, selectObject } =
    useActions(editorActions);
  const selectedObjectId = useSelector(selectors.selectedObject);

  const promptCreateMiddleware = () =>
    promptCreate("middleware", (name) => createMiddleware({ name }));

  const openContextMenu = useMenu([
    <MenuItem onClick={promptCreateMiddleware}>New middleware</MenuItem>,
  ]);

  return (
    <Panel sx={{ py: 1 }} onContextMenu={openContextMenu} {...props}>
      <Tree
        selected={selectedObjectId}
        onSelectedChanged={selectObject}
        items={middlewares.map((middleware) => ({
          nodeId: middleware.objectId,
          label: middleware.name,
          icon: <ObjectIcon type="middleware" />,
          onDoubleClick: () => promptRename(middleware),
          contextMenu: [
            <MenuItem onClick={() => promptRename(middleware)}>
              Rename
            </MenuItem>,
            <MenuItem onClick={() => confirmDelete(middleware)}>
              Delete
            </MenuItem>,
          ],
        }))}
      />
      {middlewares.length === 0 && (
        <PanelEmptyState>This game has no middlewares</PanelEmptyState>
      )}
    </Panel>
  );
}

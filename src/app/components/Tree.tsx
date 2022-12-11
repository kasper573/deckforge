import type { ComponentProps } from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MuiTreeItem from "@mui/lab/TreeItem";
import { useMemo } from "react";
import type { SingleSelectTreeViewProps } from "@mui/lab/TreeView/TreeView";
import type { UseMenuItemsConfig } from "../hooks/useMenu";
import { useMenu } from "../hooks/useMenu";

export interface TreeProps<Id>
  extends Omit<
    SingleSelectTreeViewProps,
    "selected" | "onNodeSelect" | "defaultSelected"
  > {
  selected?: Id;
  onSelectedChanged: (id: Id) => void;
}

export function Tree<Id>({
  selected,
  onSelectedChanged,
  ...props
}: TreeProps<Id>) {
  const serializedNodeId = useMemo(
    () => (selected !== undefined ? serializeTreeNodeId(selected) : undefined),
    [selected]
  );
  return (
    <TreeView
      selected={serializedNodeId ?? ""}
      multiSelect={false}
      onNodeSelect={(e, id) => onSelectedChanged(deserializeTreeNodeId(id))}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      {...props}
    />
  );
}

export interface TreeItemProps<Id>
  extends Omit<ComponentProps<typeof MuiTreeItem>, "contextMenu" | "nodeId"> {
  nodeId: Id;
  contextMenu?: UseMenuItemsConfig;
}

export function TreeItem<Id>({
  contextMenu = [],
  nodeId,
  ...props
}: TreeItemProps<Id>) {
  const [openContextMenu, menuElement] = useMenu(contextMenu);
  const serializedNodeId = useMemo(() => serializeTreeNodeId(nodeId), [nodeId]);
  return (
    <>
      <MuiTreeItem
        {...props}
        nodeId={serializedNodeId}
        onContextMenu={openContextMenu}
      />
      {menuElement}
    </>
  );
}

export function serializeTreeNodeId<Id>(nodeId: Id) {
  return JSON.stringify(nodeId);
}

export function deserializeTreeNodeId<Id>(nodeIdAsJson: string) {
  return JSON.parse(nodeIdAsJson) as Id;
}

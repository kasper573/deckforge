import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MuiTreeItem from "@mui/lab/TreeItem";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { isEqual } from "lodash";
import type { UseMenuItems } from "../hooks/useMenu";
import { useMenu } from "../hooks/useMenu";

export interface TreeProps<Id> {
  selected?: Id;
  onSelectedChanged: (id: Id) => void;
  items: TreeItemProps<Id>[];
}

export function Tree<Id>({
  items,
  selected,
  onSelectedChanged,
}: TreeProps<Id>) {
  const serializedSelected = useMemo(() => serializeId(selected), [selected]);
  const inferredExpanded = useMemo(
    () => (selected ? pathTo(items, selected) : []).map(serializeId),
    [items, selected]
  );
  return (
    <TreeView
      selected={serializedSelected ?? ""}
      expanded={inferredExpanded}
      multiSelect={false}
      onNodeSelect={(e, id) => onSelectedChanged(deserializeId(id))}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      sx={{ userSelect: "none" }}
    >
      {renderItems(items)}
    </TreeView>
  );
}

export interface TreeItemProps<Id>
  extends Pick<
    ComponentProps<typeof MuiTreeItem>,
    "onDoubleClick" | "icon" | "label"
  > {
  nodeId: Id;
  contextMenu?: UseMenuItems;
  children?: TreeItemProps<Id>[];
}

export function TreeItem<Id>({
  contextMenu = [],
  nodeId,
  children,
  onDoubleClick,
  ...props
}: TreeItemProps<Id>) {
  const openContextMenu = useMenu(contextMenu);
  const serializedNodeId = useMemo(() => serializeId(nodeId), [nodeId]);
  return (
    <MuiTreeItem
      nodeId={serializedNodeId}
      onContextMenu={openContextMenu}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(e);
      }}
      {...props}
    >
      {renderItems(children)}
    </MuiTreeItem>
  );
}

function pathTo<Id>(
  graph: TreeItemProps<Id>[],
  selected: Id,
  path: Id[] = []
): Id[] {
  for (const item of graph) {
    if (isEqual(item.nodeId, selected)) {
      return [...path, item.nodeId];
    }
    if (!item.children) {
      continue;
    }
    const result = pathTo(item.children, selected, [...path, item.nodeId]);
    if (result.length > 0) {
      return result;
    }
  }
  return [];
}

function renderItems<Id>(items?: TreeItemProps<Id>[]) {
  return items?.map((props, index) => <TreeItem key={index} {...props} />);
}

export function serializeId<Id>(nodeId?: Id) {
  return nodeId === undefined ? "" : JSON.stringify(nodeId);
}

export function deserializeId<Id>(nodeIdAsJson: string) {
  return (nodeIdAsJson === "" ? "" : JSON.parse(nodeIdAsJson)) as Id;
}

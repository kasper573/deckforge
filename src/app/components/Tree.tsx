import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MuiTreeItem from "@mui/lab/TreeItem";
import type { ComponentProps, ReactNode } from "react";
import { useMemo } from "react";
import { isEqual } from "lodash";
import Stack from "@mui/material/Stack";
import type { UseMenuItems } from "../hooks/useMenu";
import { useMenu } from "../hooks/useMenu";
import { useMovable } from "../hooks/useMovable";
import { useDraggableMuiTreeItemRef } from "../hooks/useDraggableMuiTreeItemRef";

export interface TreeProps<Id> extends CascadingTreeProps<Id> {
  selected?: Id;
  onSelectedChanged: (id: Id) => void;
  items: TreeItemProps<Id>[];
}

export interface CascadingTreeProps<Id> {
  onItemMoved?: (ids: [Id, Id]) => void;
}

export function Tree<Id>({
  items,
  selected,
  onItemMoved,
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
      {renderItems(items, { onItemMoved })}
    </TreeView>
  );
}

export interface TreeItemProps<Id>
  extends Pick<
      ComponentProps<typeof MuiTreeItem>,
      "onDoubleClick" | "icon" | "label"
    >,
    CascadingTreeProps<Id> {
  nodeId: Id;
  contextMenu?: UseMenuItems;
  children?: TreeItemProps<Id>[];
  action?: ReactNode;
}

export function TreeItem<Id>({
  contextMenu = [],
  nodeId,
  children,
  onDoubleClick,
  onItemMoved,
  label,
  action,
  ...props
}: TreeItemProps<Id>) {
  const isMoveEnabled = !!onItemMoved;
  const ref = useDraggableMuiTreeItemRef(isMoveEnabled);
  const openContextMenu = useMenu(contextMenu);
  const serializedNodeId = useMemo(() => serializeId(nodeId), [nodeId]);
  const movableProps = useMovable({
    enabled: isMoveEnabled,
    data: nodeId,
    onMove: (movedNodeId) => onItemMoved?.([movedNodeId, nodeId]),
  });

  return (
    <MuiTreeItem
      ref={ref}
      nodeId={serializedNodeId}
      onContextMenu={openContextMenu}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.(e);
      }}
      label={
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          {...movableProps}
        >
          {label}
          {action}
        </Stack>
      }
      {...props}
    >
      {renderItems(children, { onItemMoved })}
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

function renderItems<Id>(
  items?: TreeItemProps<Id>[],
  cascadingProps?: CascadingTreeProps<Id>
) {
  return items?.map((props, index) => (
    <TreeItem key={index} {...props} {...cascadingProps} />
  ));
}

export function serializeId<Id>(nodeId?: Id) {
  return nodeId === undefined ? "" : JSON.stringify(nodeId);
}

export function deserializeId<Id>(nodeIdAsJson: string) {
  return (nodeIdAsJson === "" ? "" : JSON.parse(nodeIdAsJson)) as Id;
}

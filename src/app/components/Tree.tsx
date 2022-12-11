import type { ComponentProps } from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MuiTreeItem from "@mui/lab/TreeItem";
import type { UseMenuItemsConfig } from "../hooks/useMenu";
import { useMenu } from "../hooks/useMenu";

export function Tree(props: ComponentProps<typeof TreeView>) {
  return (
    <TreeView
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      {...props}
    />
  );
}

export function TreeItem({
  contextMenu = [],
  ...props
}: Omit<ComponentProps<typeof MuiTreeItem>, "contextMenu"> & {
  contextMenu?: UseMenuItemsConfig;
}) {
  const [openContextMenu, menuElement] = useMenu(contextMenu);
  return (
    <>
      <MuiTreeItem {...props} onContextMenu={openContextMenu} />
      {menuElement}
    </>
  );
}

import type { ComponentProps, MouseEventHandler, ReactElement } from "react";
import type Menu from "@mui/material/Menu";
import type { UseMenuItemsConfig } from "../hooks/useMenu";
import { useMenu } from "../hooks/useMenu";

export interface MenuForProps
  extends Omit<ComponentProps<typeof Menu>, "children" | "open"> {
  children: UseMenuItemsConfig;
  trigger: (props: { open: MouseEventHandler }) => ReactElement;
}

/**
 * Convenience render prop variant of useMenu hook
 */
export const MenuFor = ({
  children: items,
  trigger: Trigger,
  ...menuProps
}: MenuForProps) => {
  const [openMenu, menu] = useMenu(items, menuProps);
  return (
    <>
      <Trigger open={openMenu} />
      {menu}
    </>
  );
};

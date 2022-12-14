import type { ComponentProps, MouseEventHandler, ReactElement } from "react";
import type Menu from "@mui/material/Menu";
import type { UseMenuItems, UseMenuOptions } from "../hooks/useMenu";
import { useMenu } from "../hooks/useMenu";

export interface MenuForProps
  extends Omit<ComponentProps<typeof Menu>, "children" | "open">,
    UseMenuOptions {
  children: UseMenuItems;
  trigger: (props: { open: MouseEventHandler }) => ReactElement;
}

/**
 * Convenience render prop variant of useMenu hook
 */
export const MenuFor = ({
  children: items,
  trigger,
  dontCloseOnSelect,
  ...menuProps
}: MenuForProps) => {
  const open = useMenu(items, menuProps, {
    dontCloseOnSelect: dontCloseOnSelect,
  });
  return trigger({ open });
};

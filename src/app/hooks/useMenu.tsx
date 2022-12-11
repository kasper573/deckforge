import type {
  MouseEventHandler,
  MouseEvent,
  ReactElement,
  ComponentProps,
} from "react";
import { useState } from "react";
import type MenuItem from "@mui/material/MenuItem";
import type { MenuProps } from "@mui/material/Menu";
import Menu from "@mui/material/Menu";
import { defined } from "../../lib/ts-extensions/defined";
import { concatFunctions } from "../../lib/ts-extensions/concatFunctions";

export type UseMenuItemsConfig = MenuItemRenderer | MaybeMenuItemElements;

export const useMenu = (
  menuItemsConfig: UseMenuItemsConfig,
  menuProps?: Partial<MenuProps>
) => {
  const [position, setPosition] = useState<{ left: number; top: number }>();

  const handleTrigger: MouseEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!shouldShowMenu()) {
      return;
    }
    setPosition({
      left: e.clientX,
      top: e.clientY,
    });
  };

  const handleClose: CloseHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition(undefined);
  };

  const menuItems = Array.isArray(menuItemsConfig)
    ? defined(menuItemsConfig)
    : defined(menuItemsConfig({ close: handleClose }));
  const shouldShowMenu = () => menuItems.length > 0;

  const menu = shouldShowMenu() && (
    <Menu
      {...menuProps}
      open={!!position}
      onClose={concatFunctions(
        menuProps?.onClose,
        handleClose as MenuProps["onClose"]
      )}
      onContextMenu={concatFunctions(menuProps?.onContextMenu, handleClose)}
      anchorReference="anchorPosition"
      anchorPosition={position}
      MenuListProps={{
        ...menuProps?.MenuListProps,
        onClick: concatFunctions(
          menuProps?.MenuListProps?.onClick,
          handleClose
        ),
      }}
    >
      {menuItems.map((item, index) => (
        // Wrapping each item in a span allows for nested menus.
        // It also allows us to automate keys without using cloneElement.
        <span key={index}>{item}</span>
      ))}
    </Menu>
  );

  return [handleTrigger, menu] as const;
};

export type CloseHandler = (e: MouseEvent) => void;

export type MenuItemElement = ReactElement<ComponentProps<typeof MenuItem>>;

export type MaybeMenuItemElements = Array<
  MenuItemElement | undefined | boolean
>;

export type MenuItemRendererProps = {
  close: CloseHandler;
};

export type MenuItemRenderer = (
  props: MenuItemRendererProps
) => MaybeMenuItemElements;

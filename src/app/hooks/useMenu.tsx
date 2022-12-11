import type {
  MouseEventHandler,
  MouseEvent,
  ReactElement,
  ComponentProps,
} from "react";
import { useState, cloneElement } from "react";
import type MenuItem from "@mui/material/MenuItem";
import type { MenuProps } from "@mui/material/Menu";
import Menu from "@mui/material/Menu";
import { defined } from "../../lib/ts-extensions/defined";

export type UseMenuItemsConfig = MenuItemRenderer | MaybeMenuItemElements;

export const useMenu = (
  menuItemsConfig: UseMenuItemsConfig,
  menuProps?: Partial<MenuProps>
) => {
  const [position, setPosition] = useState<{ left: number; top: number }>();
  let menuItems;

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

  const shouldShowMenu = () => menuItems.length > 0;

  if (Array.isArray(menuItemsConfig)) {
    // Item array style configuration automates close callback calls.
    menuItems = defined(menuItemsConfig).map((element) =>
      cloneElement(element, {
        onClick: (e: MouseEvent<HTMLLIElement>) => {
          handleClose(e);
          if (element.props.onClick) {
            element.props.onClick(e);
          }
        },
      })
    );
  } else {
    // Functional configuration style does not automate close callback calls.
    menuItems = defined(menuItemsConfig({ close: handleClose }));
  }

  const menu = shouldShowMenu() && (
    <Menu
      open={!!position}
      onClose={handleClose as MenuProps["onClose"]} // Need to override since MenuProps["onClose"] is poorly defined
      onContextMenu={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={position}
      {...menuProps}
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

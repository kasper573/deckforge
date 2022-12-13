import type { MouseEvent, ReactElement } from "react";
import { cloneElement, useCallback, useEffect, useMemo } from "react";
import type { MenuProps } from "@mui/material/Menu";
import Menu from "@mui/material/Menu";
import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { concatFunctions } from "../../lib/ts-extensions/concatFunctions";
import type { NominalString } from "../../lib/NominalString";

export type UseMenuItems = ReactElement[];

export interface UseMenuOptions {
  autoCloseOnSelect?: boolean;
}

export const useMenu = (
  items: UseMenuItems,
  props: Partial<MenuProps> = {},
  options: UseMenuOptions = {}
) => {
  const id = useMemo(nextId, []);

  useEffect(
    () => menuStore.getState().upsert({ id, items, props, options }),
    [id, items, props, options]
  );

  useEffect(() => () => menuStore.getState().remove(id), [id]);

  return useCallback((e: MouseEvent) => menuStore.getState().open(e, id), [id]);
};

type MenuId = NominalString<"MenuId">;
interface MenuEntry {
  id: MenuId;
  props: Partial<MenuProps>;
  options: UseMenuOptions;
  items: UseMenuItems;
}

interface MenuState {
  openId?: MenuId;
  position?: { left: number; top: number };
  menus: Map<MenuId, MenuEntry>;
  upsert(menu: MenuEntry): void;
  remove(id: MenuId): void;
  open: (e: MouseEvent, id: MenuId) => void;
  close: (e: MouseEvent) => void;
}

export type CloseHandler = (e: MouseEvent) => void;

const menuStore = createStore<MenuState>()(
  immer((set) => ({
    menus: new Map(),
    upsert(menu) {
      set((state) => {
        (state as MenuState).menus.set(menu.id, menu);
      });
    },
    remove(id) {
      set((state) => {
        state.menus.delete(id);
      });
    },
    open(e, openId) {
      e.preventDefault();
      e.stopPropagation();
      set((state) => {
        state.openId = openId;
        state.position = { left: e.clientX, top: e.clientY };
      });
    },
    close(e) {
      e.preventDefault();
      e.stopPropagation();
      set((state) => {
        state.openId = undefined;
      });
    },
  }))
);

let idCounter = 0;
function nextId() {
  return (idCounter++).toString() as MenuId;
}

export function MenuOutlet() {
  const { position, openId, menus, close } = useStore(menuStore);
  return (
    <>
      {Array.from(menus.values()).map((menu) => {
        let menuListProps = menu.props?.MenuListProps;
        if (menu.options.autoCloseOnSelect) {
          menuListProps = {
            ...menuListProps,
            onClick: concatFunctions(menuListProps?.onClick, close),
          };
        }
        return (
          <Menu
            key={menu.id}
            {...menu.props}
            open={!!position && menu.id === openId}
            onClose={concatFunctions(
              menu.props?.onClose,
              close as MenuProps["onClose"]
            )}
            anchorReference="anchorPosition"
            anchorPosition={position}
            MenuListProps={menuListProps}
          >
            {menu.items?.map((item, index) =>
              cloneElement(item, { key: index })
            )}
          </Menu>
        );
      })}
    </>
  );
}

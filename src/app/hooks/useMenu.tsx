import type { MouseEvent, ReactElement } from "react";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type { MenuProps } from "@mui/material/Menu";
import Menu from "@mui/material/Menu";
import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { concatFunctions } from "../../lib/ts-extensions/concatFunctions";

export type UseMenuItems = Array<
  ReactElement | ((close: MenuProps["onClose"]) => ReactElement)
>;

export interface UseMenuOptions {
  dontCloseOnSelect?: boolean;
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

function normalizeItems(items: UseMenuItems = [], close: MenuProps["onClose"]) {
  return items.map((item) => (isValidElement(item) ? item : item(close)));
}

type MenuId = string;
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
  immer((set, getState) => ({
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
      const menu = getState().menus.get(openId);
      if (menu?.items.length === 0) {
        return;
      }
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
        if (!menu.options.dontCloseOnSelect) {
          menuListProps = {
            ...menuListProps,
            onClick: concatFunctions(menuListProps?.onClick, close),
          };
        }
        const onClose = concatFunctions(
          menu.props?.onClose,
          close as MenuProps["onClose"]
        );
        return (
          <Menu
            key={menu.id}
            {...menu.props}
            open={!!position && menu.id === openId}
            onContextMenu={concatFunctions(menu.props?.onContextMenu, close)}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={position}
            MenuListProps={menuListProps}
          >
            {normalizeItems(menu.items, onClose).map((item, index) =>
              cloneElement(item, { key: index })
            )}
          </Menu>
        );
      })}
    </>
  );
}

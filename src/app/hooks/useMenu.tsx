import type { MouseEvent, ReactElement } from "react";
import { cloneElement, useCallback, useEffect, useMemo } from "react";
import type { MenuProps } from "@mui/material/Menu";
import Menu from "@mui/material/Menu";
import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { concatFunctions } from "../../lib/ts-extensions/concatFunctions";
import type { NominalString } from "../../lib/NominalString";

export type UseMenuItems = ReactElement[];

export const useMenu = (
  items: UseMenuItems,
  props: Partial<MenuProps> = {}
) => {
  const id = useMemo(nextId, []);

  useEffect(
    () => menuStore.getState().upsert({ id, items, props }),
    [id, items, props]
  );

  useEffect(() => () => menuStore.getState().remove(id), [id]);

  return useCallback((e: MouseEvent) => menuStore.getState().open(e, id), [id]);
};

type MenuId = NominalString<"MenuId">;
interface MenuEntry {
  id: MenuId;
  props: Partial<MenuProps>;
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

const idCounter = 0;
function nextId() {
  return idCounter.toString() as MenuId;
}

export function MenuOutlet() {
  const { position, openId, menus, close } = useStore(menuStore);
  if (!position || !openId) {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const menu = menus.get(openId)!;
  return (
    <Menu
      {...menu.props}
      open={!!position}
      onClose={concatFunctions(
        menu.props?.onClose,
        close as MenuProps["onClose"]
      )}
      onContextMenu={concatFunctions(menu.props?.onContextMenu, close)}
      anchorReference="anchorPosition"
      anchorPosition={position}
      MenuListProps={{
        ...menu.props?.MenuListProps,
        onClick: concatFunctions(menu.props?.MenuListProps?.onClick, close),
      }}
    >
      {menu.items?.map((item, index) => cloneElement(item, { key: index }))}
    </Menu>
  );
}

export type CloseHandler = (e: MouseEvent) => void;

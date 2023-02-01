import { useEffect, useRef } from "react";

export function useDraggableMuiTreeItemRef(enabled: boolean) {
  const ref = useRef<HTMLElement>();

  // Need to disable TreeView focus system to enable draggable tree items
  // see https://github.com/mui-org/material-ui/issues/29518
  useEffect(() => {
    const { current: el } = ref;
    if (el && enabled) {
      const onFocus = (e: FocusEvent) => e.stopImmediatePropagation();
      el.addEventListener("focusin", onFocus);
      return () => el.removeEventListener("focusin", onFocus);
    }
  }, [enabled]);

  return ref;
}

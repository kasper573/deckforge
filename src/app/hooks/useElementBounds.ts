import { useLayoutEffect, useState } from "react";

export function useElementBounds(element?: Element): DOMRect | undefined {
  const [bounds, setBounds] = useState<DOMRect>();

  useLayoutEffect(() => {
    if (!element) {
      setBounds(undefined);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setBounds(element.getBoundingClientRect());
      }
    });

    observer.observe(element);
    setBounds(element.getBoundingClientRect());

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return bounds;
}

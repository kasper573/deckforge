import { useLayoutEffect, useReducer, useState } from "react";

export function useElementSelector(selector: string): Element | undefined {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [element, setElement] = useState<Element>();

  useLayoutEffect(() => {
    const updateElement = () =>
      setElement(document.querySelector(selector) ?? undefined);

    const observer = new MutationObserver(() => {
      updateElement();
      forceUpdate();
    });

    observer.observe(document, { childList: true, subtree: true });
    updateElement();
    return () => observer.disconnect();
  }, [selector]);

  return element;
}

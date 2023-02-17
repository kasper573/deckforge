import { useCallback, useEffect, useMemo, useState } from "react";
import { defined } from "../../lib/ts-extensions/defined";

export function createHighlighter<Value, Id extends string>(
  idAttributePrefix: string
) {
  let idCounter = 0;
  const idMap = new Map<string, Id>();

  function setHighlighted(id: Id, show: boolean) {
    if (show) {
      document.body.setAttribute(idAttribute(id), "1");
    } else {
      document.body.removeAttribute(idAttribute(id));
    }
  }

  function idAttribute(id: Id) {
    return `${idAttributePrefix}-${id}`;
  }

  function nextId() {
    return String(idCounter++) as Id;
  }

  function valueToKey(value: Value) {
    return JSON.stringify(value);
  }

  function requireId(value: Value): Id {
    const key = valueToKey(value);
    let id = idMap.get(key);
    if (id === undefined) {
      idMap.set(key, (id = nextId()));
    }
    return id;
  }

  function freeId(value: Value) {
    idMap.delete(valueToKey(value));
  }

  function useHighlight(value: Value, enabled = false) {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const id = useMemo(() => requireId(value), [value]);
    useEffect(() => () => freeId(value), [value]);

    useEffect(() => {
      if (enabled && isHighlighted) {
        setHighlighted(id, true);
      }
      return () => setHighlighted(id, false);
    }, [enabled, isHighlighted, id]);

    const show = useCallback(() => setIsHighlighted(true), []);
    const hide = useCallback(() => setIsHighlighted(false), []);

    return {
      id,
      show: enabled ? show : undefined,
      hide: enabled ? hide : undefined,
    };
  }

  const selector = (idOrIds: Id | Id[]) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    return defined(ids)
      .map((id) => `[${idAttribute(id)}] &`)
      .join(", ");
  };

  return {
    useHighlight,
    selector,
  };
}

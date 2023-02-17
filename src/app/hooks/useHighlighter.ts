import { useCallback, useEffect, useMemo, useState } from "react";
import { isEqual } from "lodash";
import { defined } from "../../lib/ts-extensions/defined";

export type Highlighter<Value, Id extends string> = ReturnType<
  typeof createHighlighter<Value, Id>
>;

export function createHighlighter<Value, Id extends string>(
  idAttributePrefix: string
) {
  let idCounter = 0;

  // Using an array for linear lookup to support isEqual comparisons,
  // This is not a performance problem, since results are memoized.
  type LookupItem = { value: Value; id: Id };
  const idLookup: LookupItem[] = [];
  const idLookupPredicate = (value: Value) => (item: LookupItem) =>
    isEqual(item.value, value);

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

  function requireId(value: Value): Id {
    let id = idLookup.find(idLookupPredicate(value))?.id;
    if (id === undefined) {
      id = nextId();
      idLookup.push({ value, id });
    }
    return id;
  }

  function freeId(value: Value) {
    const index = idLookup.findIndex(idLookupPredicate(value));
    if (index !== -1) {
      const { id } = idLookup[index];
      idLookup.splice(index, 1);
    }
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

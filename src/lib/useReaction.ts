import type { DependencyList } from "react";
import { useEffect, useRef } from "react";

export function useReaction(fn: () => void, deps: DependencyList): void {
  const latest = useRef(fn);
  latest.current = fn;
  useEffect(() => {
    latest.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

import { useEffect } from "react";

export function useDisposable<T extends Disposable>(
  disposable?: T
): T | undefined {
  useEffect(() => () => disposable?.dispose?.(), [disposable]);
  return disposable;
}

export interface Disposable {
  dispose?: () => void;
}

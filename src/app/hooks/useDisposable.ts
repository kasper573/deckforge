import { useEffect, useState } from "react";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

export function useDisposable<T extends Disposable>(
  disposable?: T
): Result<T | undefined, unknown> {
  const [disposeError, setDisposeError] = useState<unknown>();
  useEffect(
    () => () => {
      try {
        setDisposeError(undefined);
        disposable?.dispose?.();
      } catch (error) {
        setDisposeError(error);
      }
    },
    [disposable]
  );

  return disposeError ? err(disposeError) : ok(disposable);
}

export interface Disposable {
  dispose?: () => void;
}

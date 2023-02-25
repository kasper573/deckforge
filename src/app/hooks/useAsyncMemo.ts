import { useEffect, useState } from "react";

export function useAsyncMemo<T>(fetch: () => Promise<T>): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    let isCancelled = false;
    fetch().then((value) => {
      if (!isCancelled) {
        setValue(() => value);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [fetch]);

  return value;
}

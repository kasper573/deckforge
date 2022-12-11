import { useEffect, useRef } from "react";
import { isEqual as isDeepEqual } from "lodash";

export function useOnChange<T>(
  value: T,
  handleChange: (value: T) => void,
  {
    isEqual = isDeepEqual,
    handleInitial = false,
  }: {
    isEqual?: (a: T, b: T) => boolean;
    handleInitial?: boolean;
  } = {}
) {
  const previousValue = useRef(value);
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current && handleInitial) {
      isFirstRun.current = false;
      handleChange(value);
      return;
    }

    if (!isEqual(value, previousValue.current)) {
      handleChange(value);
      previousValue.current = value;
    }
  }, [value, handleChange, isEqual, handleInitial]);
}

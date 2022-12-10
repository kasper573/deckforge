import { useEffect, useRef } from "react";
import { isEqual as isDeepEqual } from "lodash";

export function useOnChange<T>(
  value: T,
  handleChange: (value: T) => void,
  isEqual: (a: T, b: T) => boolean = isDeepEqual
) {
  const previousValue = useRef(value);
  useEffect(() => {
    if (!isEqual(value, previousValue.current)) {
      handleChange(value);
      previousValue.current = value;
    }
  }, [value, handleChange, isEqual]);
}

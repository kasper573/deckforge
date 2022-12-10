import { useDebouncedCallback } from "use-debounce";
import { useEffect, useRef, useState } from "react";

const defaultDebounceTime = 250;

export function useDebouncedControl<Value>({
  value: inputValue,
  debounce = true,
  onChange,
}: {
  debounce?: number | boolean;
  value: Value;
  onChange?: (newValue: Value) => void;
}) {
  const [value, setValue] = useState(inputValue);

  const debounceTime = debounce === true ? defaultDebounceTime : debounce || 0;
  const enqueueChange = useDebouncedCallback(
    (output: Value) => onChange?.(output),
    debounceTime
  );

  const latestEnqueueChange = useRef(enqueueChange);
  latestEnqueueChange.current = enqueueChange;

  useEffect(() => {
    if (!latestEnqueueChange.current.isPending()) {
      setValue(inputValue);
    }
  }, [inputValue]);

  return {
    value,
    flush: () => enqueueChange.flush(),
    setValue(newValue: Value) {
      setValue(newValue);
      enqueueChange(newValue);
    },
  };
}

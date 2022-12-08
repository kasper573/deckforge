import { useDebouncedCallback } from "use-debounce";
import { useEffect, useState } from "react";

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
  const [value, setValue] = useReinitializingState(inputValue);

  const debounceTime = debounce === true ? defaultDebounceTime : debounce || 0;
  const enqueueChange = useDebouncedCallback(
    (output: Value) => onChange?.(output),
    debounceTime
  );

  return {
    value,
    flush: () => enqueueChange.flush(),
    setValue(newValue: Value) {
      setValue(newValue);
      enqueueChange(newValue);
    },
  };
}

function useReinitializingState<State>(initialState: State) {
  const [state, setState] = useState(initialState);
  useEffect(() => setState(initialState), [initialState]);
  return [state, setState] as const;
}

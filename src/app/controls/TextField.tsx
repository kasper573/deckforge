import type { TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";
import MuiTextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export type TextFieldProps = Omit<MuiTextFieldProps, "value"> & {
  value: string;
  onValueChange: (newValue: string) => void;
  debounce?: number | boolean;
};

const defaultDebounceTime = 250;

export function TextField({
  value: inputValue,
  onValueChange,
  debounce,
  ...rest
}: TextFieldProps) {
  const [text, setText] = useReinitializingState(inputValue);

  const debounceTime = debounce === true ? defaultDebounceTime : debounce || 0;
  const enqueueChange = useDebouncedCallback(
    (output: string) => onValueChange?.(output),
    debounceTime
  );

  return (
    <MuiTextField
      value={text}
      onBlur={() => enqueueChange.flush()}
      onChange={(e) => {
        setText(e.target.value);
        enqueueChange(e.target.value);
      }}
      {...rest}
    />
  );
}

export function useReinitializingState<State>(initialState: State) {
  const [state, setState] = useState(initialState);
  useEffect(() => setState(initialState), [initialState]);
  return [state, setState] as const;
}

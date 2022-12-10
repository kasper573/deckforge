import type { TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";
import MuiTextField from "@mui/material/TextField";
import { useDebouncedControl } from "../hooks/useDebouncedControl";

export type TextFieldProps = Omit<MuiTextFieldProps, "value"> & {
  value: string;
  onValueChange: (newValue: string) => void;
  debounce?: number | boolean;
};

export function TextField({
  value,
  onValueChange,
  debounce = false,
  ...rest
}: TextFieldProps) {
  const control = useDebouncedControl({
    value,
    debounce,
    onChange: onValueChange,
  });
  return (
    <MuiTextField
      value={control.value}
      onBlur={() => control.flush()}
      onChange={(e) => control.setValue(e.target.value)}
      {...rest}
    />
  );
}

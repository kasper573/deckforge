import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MuiSelect from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import type { ComponentProps } from "react";

export interface SelectProps<Option>
  extends Omit<
    ComponentProps<typeof MuiSelect>,
    "value" | "defaultValue" | "onChange"
  > {
  value: Option;
  defaultValue?: Option;
  options: Option[];
  onChange: (value: Option) => void;
  getOptionLabel: (option: Option) => string;
  getOptionValue: (option: Option) => string;
}
export function Select<Option>({
  label,
  value,
  options,
  onChange,
  getOptionValue,
  getOptionLabel,
}: SelectProps<Option>) {
  return (
    <SelectFormControl
      value={getOptionValue(value)}
      defaultValue={getOptionValue(value)}
      label={label}
      onChange={(e) => {
        const newOption = options.find(
          (option) => getOptionValue(option) === e.target.value
        );
        if (newOption) {
          onChange(newOption);
        }
      }}
    >
      {options.map((option, index) => (
        <MenuItem key={index} value={getOptionValue(option)}>
          {getOptionLabel(option)}
        </MenuItem>
      ))}
    </SelectFormControl>
  );
}

export function SelectFormControl({
  label,
  ...props
}: ComponentProps<typeof MuiSelect>) {
  return (
    <FormControl>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect label={label} {...props} />
    </FormControl>
  );
}

import type { HTMLAttributes } from "react";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import { forwardRef } from "react";

export interface SelectProps
  extends Omit<HTMLAttributes<HTMLSelectElement>, "error"> {
  label?: string;
  error?: boolean;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, helperText, style, className, id, ...selectProps },
    ref
  ) {
    return (
      <FormControl {...{ style, className }}>
        {label && <InputLabel htmlFor={id}>Select</InputLabel>}
        <select ref={ref} id={id} {...selectProps} />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

import type { InputHTMLAttributes } from "react";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import { forwardRef } from "react";
import { styled } from "@mui/material/styles";

export interface SelectProps
  extends Omit<InputHTMLAttributes<HTMLSelectElement>, "error" | "children"> {
  label?: string;
  error?: boolean;
  helperText?: string;
  options: string[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      error,
      helperText,
      style,
      className,
      id = label ? labelToId(label) : undefined,
      options,
      ...selectProps
    },
    ref
  ) {
    return (
      <FormControl {...{ style, className }}>
        {label && (
          <InputLabel shrink htmlFor={id}>
            {label}
          </InputLabel>
        )}
        <StyledSelect ref={ref} id={id} {...selectProps}>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </StyledSelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

const StyledSelect = styled("select")`
  height: ${(props) => props.theme.spacing(5)};
  background: transparent;
  padding: ${(props) => props.theme.spacing(0, 2)};
  color: ${(props) => props.theme.palette.text.primary};
  border: 1px solid ${(props) => props.theme.palette.divider};
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  ${(props) => props.theme.typography.body1};
`;

const labelToId = (label: string) => label.replace(/\s+/g, "-").toLowerCase();

import TextField from "@mui/material/TextField";
import type { ComponentProps } from "react";
import { forwardRef } from "react";

export const DialogTextField = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof TextField>
>(function DialogTextField(props, ref) {
  return (
    <TextField
      ref={ref}
      margin="dense"
      fullWidth
      variant="standard"
      {...props}
    />
  );
});

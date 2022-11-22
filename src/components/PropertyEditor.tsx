import Paper from "@mui/material/Paper";
import type { ComponentProps } from "react";

export function PropertyEditor({ sx, ...props }: ComponentProps<typeof Paper>) {
  return (
    <Paper sx={{ p: 2, width: 200, ...sx }} {...props}>
      Property Editor
    </Paper>
  );
}

import Paper from "@mui/material/Paper";
import type { ComponentProps } from "react";

export function CodeEditor({ sx, ...props }: ComponentProps<typeof Paper>) {
  return (
    <Paper sx={{ p: 2, ...sx }} {...props}>
      Code Editor
    </Paper>
  );
}

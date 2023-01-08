import CircularProgress from "@mui/material/CircularProgress";
import type { ComponentProps } from "react";

export const LoadingIndicator = (
  props: ComponentProps<typeof CircularProgress>
) => (
  <CircularProgress
    role="progressbar"
    data-testid="loading-indicator"
    {...props}
  />
);

import CircularProgress from "@mui/material/CircularProgress";
import type { ComponentProps } from "react";
import LinearProgress from "@mui/material/LinearProgress";

export const LoadingIndicator = ({
  variant = "circular",
  ...props
}: Omit<ComponentProps<typeof CircularProgress>, "variant"> & {
  variant?: "linear" | "circular";
}) => {
  const Indicator = {
    linear: LinearProgress,
    circular: CircularProgress,
  }[variant];
  return (
    <Indicator role="progressbar" data-testid="loading-indicator" {...props} />
  );
};

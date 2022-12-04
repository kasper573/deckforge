import Button from "@mui/material/Button";
import type { ComponentProps } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

export interface ProgressButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function ProgressButton({
  children,
  disabled,
  isLoading,
  ...props
}: ProgressButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading ? <LoadingIndicator size={24} /> : children}
    </Button>
  );
}

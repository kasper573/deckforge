import Button from "@mui/material/Button";
import type { ComponentProps } from "react";

export interface ProgressButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function ProgressButton({
  children,
  disabled,
  isLoading,
  ...props
}: ProgressButtonProps) {
  // Note that progress buttons only disable and do not show any loading indicator
  // because the layout already has a global loading indicator / loading page.
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {children}
    </Button>
  );
}

import Breadcrumbs from "@mui/material/Breadcrumbs";
import type { ComponentProps } from "react";
import useTheme from "@mui/material/styles/useTheme";

export function Header({
  children,
  breadcrumbs = true,
  sx,
  ...props
}: {
  breadcrumbs?: boolean;
} & Omit<ComponentProps<typeof Breadcrumbs>, "title">) {
  const theme = useTheme();
  return (
    <Breadcrumbs
      role="heading"
      sx={{ height: 24, mb: 2, ...theme.typography.h6, ...sx }}
      {...props}
    >
      {children}
    </Breadcrumbs>
  );
}

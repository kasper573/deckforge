import Breadcrumbs from "@mui/material/Breadcrumbs";
import useTheme from "@mui/material/styles/useTheme";
import type { ReactNode } from "react";

export function Header({ children }: { children?: ReactNode }) {
  const theme = useTheme();
  return (
    <Breadcrumbs
      role="heading"
      sx={{ height: 24, mb: 2, ...theme.typography.h6 }}
    >
      {typeof children === "string" ? <span>{children}</span> : children}
    </Breadcrumbs>
  );
}

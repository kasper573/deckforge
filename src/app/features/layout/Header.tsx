import type { ReactNode } from "react";
import Typography from "@mui/material/Typography";

export function Header({ children }: { children?: ReactNode }) {
  return (
    <Typography role="heading" color="lightgrey" variant="h6" paragraph>
      {children}
    </Typography>
  );
}

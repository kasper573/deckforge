import type { HTMLAttributes } from "react";
import Typography from "@mui/material/Typography";

export function Header(props: HTMLAttributes<HTMLDivElement>) {
  return <Typography component="div" variant="h5" paragraph {...props} />;
}

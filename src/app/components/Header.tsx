import type { ComponentProps } from "react";
import Typography from "@mui/material/Typography";

export function Header(props: ComponentProps<typeof Typography>) {
  return <Typography variant="h5" paragraph {...props} />;
}

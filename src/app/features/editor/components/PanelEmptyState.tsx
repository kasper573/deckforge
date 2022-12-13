import Box from "@mui/material/Box";
import type { ComponentProps } from "react";

export function PanelEmptyState(props: ComponentProps<typeof Box>) {
  return <Box textAlign="center" color="text.secondary" {...props} />;
}

import { ComponentProps } from "react";
import Box from "@mui/material/Box";

export const Status = (props: ComponentProps<typeof Box>) => (
  <Box {...props}>status</Box>
);
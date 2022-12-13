import Box from "@mui/material/Box";
import type { ComponentProps } from "react";
import { Center } from "../../../components/Center";

export function PanelEmptyState(props: ComponentProps<typeof Box>) {
  return (
    <Center>
      <Box color="text.secondary" sx={{ whiteSpace: "nowrap" }} {...props} />
    </Center>
  );
}

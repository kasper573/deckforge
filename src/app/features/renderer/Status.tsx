import type { ComponentProps } from "react";
import Box from "@mui/material/Box";
import type { RuntimePlayer } from "../runtime/Entities";

export const Status = ({
  player,
  ...props
}: ComponentProps<typeof Box> & { player: RuntimePlayer }) => (
  <Box sx={{ color: "black" }} {...props}>
    HP: {player.health}
  </Box>
);

import type { ComponentProps } from "react";
import Box from "@mui/material/Box";
import type { Builtins } from "./definition";

export const Status = ({
  player,
  ...props
}: ComponentProps<typeof Box> & { player: Builtins["player"] }) => (
  <Box sx={{ color: "black" }} {...props}>
    HP: {player.properties.health}
  </Box>
);

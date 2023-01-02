import type { ComponentProps } from "react";
import Box from "@mui/material/Box";
import type { React1v1Types } from "./definition";

export const PlayerStatus = ({
  player,
  ...props
}: ComponentProps<typeof Box> & { player: React1v1Types["player"] }) => (
  <Box sx={{ color: "black" }} {...props}>
    HP: {player.properties.health}
  </Box>
);

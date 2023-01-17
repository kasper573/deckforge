import type { ComponentProps } from "react";
import type Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { React1v1Types } from "../definition";

export const PlayerStatus = ({
  player,
  ...props
}: ComponentProps<typeof Box> & { player: React1v1Types["player"] }) => (
  <Stack direction="row" spacing={2} sx={{ color: "black" }} {...props}>
    <span>
      HP: {player.properties.health}/{player.properties.healthMax}
    </span>
    <span>
      MP: {player.properties.mana}/{player.properties.manaMax}
    </span>
  </Stack>
);

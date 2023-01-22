import type { ComponentProps } from "react";
import type Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { VersusTypes } from "../runtimeDefinition";

export const PlayerStatus = ({
  player,
  ...props
}: ComponentProps<typeof Box> & { player: VersusTypes["player"] }) => (
  <Stack direction="row" spacing={2} sx={{ color: "black" }} {...props}>
    <span>
      HP: {player.properties.health}/{player.properties.healthMax}
    </span>
    <span>
      MP: {player.properties.mana}/{player.properties.manaMax}
    </span>
  </Stack>
);

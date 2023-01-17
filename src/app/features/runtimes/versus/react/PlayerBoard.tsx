import type { ComponentProps, ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import type { VersusTypes } from "../definition";
import { PlayerStatus } from "./PlayerStatus";
import { CardPile } from "./CardPile";
import { PlayerHand } from "./PlayerHand";

export function PlayerBoard({
  sx,
  placement,
  player,
  opponent,
  children,
  ...props
}: ComponentProps<typeof Stack> & {
  placement: "top" | "bottom";
  player: VersusTypes["player"];
  opponent: VersusTypes["player"];
  children?: ReactNode;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        height: "35%",
        width: "100%",
        left: 0,
        right: 0,
        [placement]: 0,
        ...sx,
      }}
      {...props}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          position: "absolute",
          [placement === "top" ? "bottom" : "top"]: 0,
          width: "100%",
          px: 2,
          transform: `translateY(${placement === "top" ? 100 : -100}%)`,
        }}
      >
        <PlayerStatus player={player} />
        {children}
      </Stack>
      <Stack
        sx={{
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          p: 2,
        }}
        direction="row"
        spacing={2}
      >
        <CardPile name="Discard" size={player.board.discard.size} />
        <PlayerHand
          cards={player.board.hand}
          player={player}
          target={opponent}
        />
        <CardPile name="Draw" size={player.board.draw.size} />
      </Stack>
    </Box>
  );
}

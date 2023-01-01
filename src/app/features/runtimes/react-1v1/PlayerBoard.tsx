import type { ComponentProps } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { Status } from "./Status";
import { EndTurnButton } from "./EndTurnButton";
import { CardPile } from "./CardPile";
import { Hand } from "./Hand";
import type { React1v1Types } from "./definition";
import { adapter } from "./definition";

export function PlayerBoard({
  sx,
  placement,
  player,
  opponent,
  ...props
}: ComponentProps<typeof Stack> & {
  placement: "top" | "bottom";
  player: React1v1Types["player"];
  opponent: React1v1Types["player"];
}) {
  const actions = adapter.useRuntimeActions();
  const drawCard = () => actions.drawCard(player.id);
  const endTurn = () => actions.endTurn();
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
        <Status player={player} />
        <EndTurnButton onClick={endTurn} />
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
        <CardPile name="Discard" size={player.cards.discard.size} />
        <Hand
          cards={player.cards.hand}
          playCardProps={{
            playerId: player.id,
            targetId: opponent.id,
          }}
        />
        <CardPile
          name="Draw"
          size={player.cards.draw.size}
          onClick={drawCard}
        />
      </Stack>
    </Box>
  );
}

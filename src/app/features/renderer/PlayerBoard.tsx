import type { ComponentProps } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import type { RuntimeBattleId, RuntimeBattleMember } from "../runtime/Entities";
import { Status } from "./Status";
import { EndTurnButton } from "./EndTurnButton";
import { CardPile } from "./CardPile";
import { Hand } from "./Hand";
import { useRuntimeActions } from "./ReactRuntimeAdapter";

export function PlayerBoard({
  sx,
  placement,
  battleId,
  player,
  ...props
}: ComponentProps<typeof Stack> & {
  placement: "top" | "bottom";
  player: RuntimeBattleMember;
  battleId: RuntimeBattleId;
}) {
  const actions = useRuntimeActions();
  const drawCard = () =>
    actions.drawCard({ playerId: player.playerId, battleId });
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
        <Status />
        <EndTurnButton />
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
        <CardPile name="Discard" size={player.cards.discard.length} />
        <Hand cards={player.cards.hand} />
        <CardPile
          name="Draw"
          size={player.cards.draw.length}
          onClick={drawCard}
        />
      </Stack>
    </Box>
  );
}

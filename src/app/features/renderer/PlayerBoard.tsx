import type { ComponentProps } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import type { RuntimeBattleId, RuntimeBattleMember } from "../runtime/Entities";
import {
  useRuntimeActions,
  useRuntimeState,
} from "../runtime/ReactRuntimeAdapter";
import { Status } from "./Status";
import { EndTurnButton } from "./EndTurnButton";
import { CardPile } from "./CardPile";
import { Hand } from "./Hand";

export function PlayerBoard({
  sx,
  placement,
  battleId,
  player,
  opponent,
  ...props
}: ComponentProps<typeof Stack> & {
  placement: "top" | "bottom";
  player: RuntimeBattleMember;
  battleId: RuntimeBattleId;
  opponent: RuntimeBattleMember;
}) {
  const actions = useRuntimeActions();
  const playerInfo = useRuntimeState((state) =>
    state.players.get(player.playerId)
  );
  const drawCard = () =>
    actions.drawCard({ playerId: player.playerId, battleId });
  const endTurn = () => actions.endTurn(battleId);
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
        {playerInfo && <Status player={playerInfo} />}
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
        <CardPile name="Discard" size={player.cards.discard.length} />
        <Hand
          cards={player.cards.hand}
          playCardProps={{
            playerId: player.playerId,
            battleId,
            targetId: opponent.playerId,
          }}
        />
        <CardPile
          name="Draw"
          size={player.cards.draw.length}
          onClick={drawCard}
        />
      </Stack>
    </Box>
  );
}

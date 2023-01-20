import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { RuntimePlayerId } from "../../../../compiler/types";
import { adapter } from "../../runtimeDefinition";
import { Center } from "../../../../../components/Center";

export function ResultScene({ winner }: { winner: RuntimePlayerId }) {
  const players = adapter.useRuntimeState((state) => state.players);
  const { restartGame } = adapter.useRuntimeActions();

  function getPlayerName(id: RuntimePlayerId) {
    const index = players.findIndex((p) => p.id === id);
    return `Player ${index + 1}`;
  }

  return (
    <Center>
      <Typography sx={{ textAlign: "center", color: "black" }}>
        {getPlayerName(winner)} won!
      </Typography>
      <Button variant="contained" onClick={restartGame} sx={{ mt: 2 }}>
        Play again
      </Button>
    </Center>
  );
}

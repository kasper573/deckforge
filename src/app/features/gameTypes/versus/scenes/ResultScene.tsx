import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { RuntimePlayerId } from "../../../compiler/types";
import { adapter } from "../runtimeDefinition";
import { Center } from "../../../../components/Center";

export function ResultScene({ winner: winnerId }: { winner: RuntimePlayerId }) {
  const players = adapter.useRuntimeState((state) => state.players);
  const { restartGame } = adapter.useRuntimeActions();
  const winner = players.find((p) => p.id === winnerId);

  return (
    <Center>
      <Typography sx={{ textAlign: "center", color: "black" }}>
        {winner?.properties.name} won!
      </Typography>
      <Button variant="contained" onClick={restartGame} sx={{ mt: 2 }}>
        Play again
      </Button>
    </Center>
  );
}

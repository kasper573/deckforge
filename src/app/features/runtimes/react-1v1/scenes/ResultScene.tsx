import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import type { RuntimePlayerId } from "../../../compiler/types";
import { adapter } from "../definition";
import { Center } from "../../../../components/Center";

export function ResultScene({ winner }: { winner: RuntimePlayerId }) {
  const [player1, player2] = adapter.useRuntimeState((state) => state.players);
  const { startBattle } = adapter.useRuntimeActions();
  return (
    <Center>
      <Typography sx={{ textAlign: "center", color: "black" }}>
        {winner === player1.id ? "You win!" : "You lost!"}
      </Typography>
      <Button variant="contained" onClick={startBattle} sx={{ mt: 2 }}>
        Play again
      </Button>
    </Center>
  );
}

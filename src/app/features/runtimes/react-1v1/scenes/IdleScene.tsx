import Button from "@mui/material/Button";
import { adapter } from "../definition";
import { Center } from "../../../../components/Center";

export function IdleScene() {
  const { startBattle } = adapter.useRuntimeActions();
  return (
    <Center>
      <Button variant="contained" onClick={startBattle} sx={{ mt: 2 }}>
        Start game
      </Button>
    </Center>
  );
}

import Button from "@mui/material/Button";
import { Logo } from "../layout/Logo";
import { useCreateGame } from "../editor/hooks";

export function DefaultAppBarContent() {
  const createGame = useCreateGame();
  return (
    <>
      <Logo />
      <Button
        sx={{ ml: "auto" }}
        size="small"
        variant="contained"
        onClick={() => createGame("New game")}
      >
        Create game
      </Button>
    </>
  );
}

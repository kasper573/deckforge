import Button from "@mui/material/Button";
import { Logo } from "../layout/Logo";

export function DefaultAppBarContent() {
  return (
    <>
      <Logo />
      <Button sx={{ ml: "auto" }} size="small" variant="contained">
        Create game
      </Button>
    </>
  );
}

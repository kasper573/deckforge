import { ComponentProps } from "react";
import Button from "@mui/material/Button";

export const EndTurnButton = (props: ComponentProps<typeof Button>) => (
  <Button variant="contained" {...props}>
    End Turn
  </Button>
);
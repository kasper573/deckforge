import type { ComponentProps } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { Status } from "./Status";
import { EndTurnButton } from "./EndTurnButton";
import { DiscardPile } from "./DiscardPile";
import { Hand } from "./Hand";
import { DrawPile } from "./DrawPile";

export function PlayerBoard({
  sx,
  placement,
  ...props
}: ComponentProps<typeof Stack> & { placement: "top" | "bottom" }) {
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
        <DiscardPile />
        <Hand />
        <DrawPile />
      </Stack>
    </Box>
  );
}

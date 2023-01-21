import type { ComponentProps } from "react";
import Typography from "@mui/material/Typography";
import type { GameTypeId } from "../../../api/services/game/types";
import type { GameRendererProps } from "../gameTypes/GameType";
import { gameTypes } from "../gameTypes";
import { Center } from "../../components/Center";
import type { RuntimeGenerics } from "./types";

export function GameRenderer<G extends RuntimeGenerics>({
  type,
  ...rendererProps
}: GameRendererProps<G> & { type: GameTypeId }) {
  const gameType = gameTypes.get(type);
  if (!gameType) {
    return (
      <Center>
        <Typography color="error">Unknown game type: {type}</Typography>
      </Center>
    );
  }

  const { renderer: Renderer } = gameType;
  return <Renderer {...(rendererProps as ComponentProps<typeof Renderer>)} />;
}

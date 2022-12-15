import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { useStore } from "zustand";
import Button from "@mui/material/Button";
import type { Game } from "../../../api/services/game/types";
import { Center } from "../../components/Center";
import { RuntimePlayer } from "../../../lib/deckforge/Entities";
import type { RuntimeDeckId } from "../../../lib/deckforge/Entities";
import { PlayerBoard } from "./PlayerBoard";
import { createRuntime } from "./createRuntime";
import { useCreateRuntimeStore } from "./ReactRuntimeAdapter";

export interface GameRuntimeProps extends ComponentProps<typeof Viewport> {
  game: Game;
}

function generatePlayers(deck?: RuntimeDeckId) {
  if (!deck) {
    throw new Error("No deck provided");
  }
  const p1 = new RuntimePlayer(deck, 5);
  const p2 = new RuntimePlayer(deck, 5);
  return new Map([
    [p1.id, p1],
    [p2.id, p2],
  ]);
}

export function GameRuntime({ game, ...viewportProps }: GameRuntimeProps) {
  const runtime = useMemo(
    () =>
      createRuntime(game, {
        players: generatePlayers(game.definition.decks[0].deckId),
      }),
    [game]
  );
  const store = useCreateRuntimeStore(runtime);
  const { state, performAction } = useStore(store);
  const battle = Array.from(state.battles.values())[0];

  function generateAndStartBattle() {
    const [p1, p2] = Array.from(state.players.keys());
    performAction("startBattle", [p1, p2]);
  }

  return (
    <Viewport {...viewportProps}>
      {battle ? (
        <>
          <PlayerBoard placement="bottom" player={battle.member1} />
          <PlayerBoard placement="top" player={battle.member2} />
        </>
      ) : (
        <Center>
          <Button variant="contained" onClick={generateAndStartBattle}>
            Start battle
          </Button>
        </Center>
      )}
    </Viewport>
  );
}

const Viewport = styled("div")`
  background: skyblue;
  position: relative;
`;

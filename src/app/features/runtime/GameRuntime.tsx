import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { useStore } from "zustand";
import Button from "@mui/material/Button";
import type { Game } from "../../../api/services/game/types";
import { Center } from "../../components/Center";
import { RuntimePlayer } from "../../../lib/deckforge/Entities";
import { PlayerBoard } from "./PlayerBoard";
import type { RuntimeInitialState } from "./createRuntime";
import { createRuntime } from "./createRuntime";
import { useCreateRuntimeStore } from "./ReactRuntimeAdapter";

export interface GameRuntimeProps extends ComponentProps<typeof Viewport> {
  game: Game;
}

export function GameRuntime({ game, ...viewportProps }: GameRuntimeProps) {
  const runtime = useMemo(
    () => createRuntime(game, createInitialState(game)),
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

function createInitialState(game?: Game): RuntimeInitialState | undefined {
  const deck = game ? Array.from(game.definition.decks.values())[0] : undefined;
  if (!deck) {
    throw new Error("No game or deck available, cannot start battle");
  }
  const p1 = new RuntimePlayer(deck.deckId, 5);
  const p2 = new RuntimePlayer(deck.deckId, 5);
  return {
    players: new Map([
      [p1.id, p1],
      [p2.id, p2],
    ]),
  };
}

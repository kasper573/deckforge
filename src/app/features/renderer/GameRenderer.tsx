import { styled } from "@mui/material/styles";
import type { ComponentProps } from "react";
import { useMemo } from "react";
import { useStore } from "zustand";
import Button from "@mui/material/Button";
import type { Game } from "../../../api/services/game/types";
import { Center } from "../../components/Center";
import { RuntimePlayer } from "../runtime/Entities";
import {
  RuntimeContext,
  useCreateRuntimeStore,
} from "../runtime/ReactRuntimeAdapter";
import { PlayerBoard } from "./PlayerBoard";
import type { GameCompilerInitialState } from "./compileGame";
import { compileGame } from "./compileGame";

export interface GameRendererProps extends ComponentProps<typeof Viewport> {
  game: Game;
}

export function GameRenderer({ game, ...viewportProps }: GameRendererProps) {
  const runtime = useMemo(
    () => compileGame(game, createInitialState(game)),
    [game]
  );
  const store = useCreateRuntimeStore(runtime);
  const { state, actions } = useStore(store);
  const battle = Array.from(state.battles.values())[0];

  function startBattle() {
    const [p1, p2] = Array.from(state.players.keys());
    actions.startBattle([p1, p2]);
  }

  return (
    <RuntimeContext.Provider value={store}>
      <Viewport {...viewportProps}>
        {battle ? (
          <>
            <PlayerBoard
              placement="bottom"
              player={battle.member1}
              opponent={battle.member2}
              battleId={battle.id}
            />
            <PlayerBoard
              placement="top"
              player={battle.member2}
              opponent={battle.member1}
              battleId={battle.id}
            />
          </>
        ) : (
          <Center>
            <Button variant="contained" onClick={startBattle}>
              Start battle
            </Button>
          </Center>
        )}
      </Viewport>
    </RuntimeContext.Provider>
  );
}

const Viewport = styled("div")`
  background: skyblue;
  position: relative;
  user-select: none;
`;

function createInitialState(game?: Game): GameCompilerInitialState | undefined {
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

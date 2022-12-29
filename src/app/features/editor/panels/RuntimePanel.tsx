import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useMemo, useReducer } from "react";
import { v4 } from "uuid";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { Panel } from "../components/Panel";
import { GameRenderer } from "../../runtimes/react-1v1/GameRenderer";
import type { FallbackProps } from "../../../ErrorBoundary";
import { ErrorBoundary } from "../../../ErrorBoundary";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { PanelControls } from "../components/PanelControls";
import { compileGame } from "../../compiler/compileGame";
import type { DeckId } from "../../../../api/services/game/types";
import type { RuntimeCard } from "../../compiler/defineRuntime";
import type { React1v1Types } from "../../runtimes/react-1v1/definition";
import { Reload } from "../../../components/icons";
import type { PanelProps } from "./definition";

export function RuntimePanel(props: PanelProps) {
  const [manualResetCount, resetRuntime] = useReducer((c) => c + 1, 0);
  const game = useSelector(selectors.game);
  const compiled = useMemo(
    () => (game ? compileGame(game.definition, createInitialState) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, manualResetCount]
  );
  return (
    <Panel
      toolbarControls={
        <PanelControls>
          <Tooltip title="Reset runtime">
            <IconButton
              disabled={!!compiled?.error}
              size="small"
              onClick={resetRuntime}
            >
              <Reload />
            </IconButton>
          </Tooltip>
        </PanelControls>
      }
      {...props}
    >
      {compiled &&
        (compiled?.runtime ? (
          <ErrorBoundary fallback={RuntimeErrorFallback}>
            <GameRenderer runtime={compiled.runtime} sx={{ flex: 1 }} />
          </ErrorBoundary>
        ) : (
          <PanelEmptyState>
            <Typography variant="h5">Compiler error</Typography>
            <Typography sx={{ my: 1 }}>{`${compiled.error}`}</Typography>
          </PanelEmptyState>
        ))}
    </Panel>
  );
}

function RuntimeErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <PanelEmptyState>
      <Typography variant="h5">Runtime error</Typography>
      <Typography sx={{ my: 1 }}>{error.message}</Typography>
      <Button onClick={resetErrorBoundary}>Retry</Button>
    </PanelEmptyState>
  );
}

function createInitialState(
  decks: Map<DeckId, RuntimeCard[]>
): React1v1Types["state"] {
  const deck = Array.from(decks.values())[0];
  if (!deck) {
    throw new Error("No game or deck available, cannot start battle");
  }
  function createPlayer(): React1v1Types["player"] {
    return {
      id: v4() as React1v1Types["playerId"],
      properties: { health: 5 },
      cards: {
        hand: [],
        deck,
        discard: [],
        draw: [],
      },
    };
  }
  return {
    players: [createPlayer(), createPlayer()],
  };
}

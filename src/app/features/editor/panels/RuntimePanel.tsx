import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useMemo, useReducer } from "react";
import { useSelector } from "../store";
import { selectors } from "../selectors";
import { Panel } from "../components/Panel";
import type { FallbackProps } from "../../../ErrorBoundary";
import { PanelEmptyState } from "../components/PanelEmptyState";
import { PanelControls } from "../components/PanelControls";
import { compileGame } from "../../compiler/compileGame";
import { Reload } from "../../../components/icons";
import type { RuntimeGenerics } from "../../compiler/types";
import { GameRenderer } from "../../runtimes/react-1v1/GameRenderer";
import { ErrorBoundary } from "../../../ErrorBoundary";
import type { PanelProps } from "./definition";

export function RuntimePanel(props: PanelProps) {
  const [manualResetCount, resetRuntime] = useReducer((c) => c + 1, 0);
  const gameDefinition = useSelector(selectors.gameDefinition);
  const runtimeDefinition = useSelector(selectors.runtimeDefinition);
  const compiled = useMemo(
    () => {
      if (gameDefinition && runtimeDefinition) {
        return compileGame<RuntimeGenerics>(runtimeDefinition, gameDefinition);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameDefinition, runtimeDefinition, manualResetCount]
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

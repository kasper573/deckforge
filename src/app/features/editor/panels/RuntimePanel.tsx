import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { Panel } from "../components/Panel";
import { GameRuntime } from "../../renderer/GameRuntime";
import type { FallbackProps } from "../../../ErrorBoundary";
import { ErrorBoundary } from "../../../ErrorBoundary";
import { PanelEmptyState } from "../components/PanelEmptyState";
import type { PanelProps } from "./definition";

export function RuntimePanel(props: PanelProps) {
  const game = useSelector(selectors.game);
  return (
    <Panel {...props}>
      <ErrorBoundary fallback={RuntimeErrorFallback}>
        {game && <GameRuntime game={game} sx={{ flex: 1 }} />}
      </ErrorBoundary>
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

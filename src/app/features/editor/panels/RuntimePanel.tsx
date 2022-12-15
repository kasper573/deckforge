import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { Panel } from "../components/Panel";
import { GameRuntime } from "../../runtime/GameRuntime";
import { ErrorBoundary } from "../../../ErrorBoundary";
import { PanelEmptyState } from "../components/PanelEmptyState";
import type { PanelProps } from "./definition";

export function RuntimePanel(props: PanelProps) {
  const game = useSelector(selectors.game);
  return (
    <Panel {...props}>
      <ErrorBoundary
        fallback={({ error }) => (
          <PanelEmptyState>{error.message}</PanelEmptyState>
        )}
      >
        {game && <GameRuntime game={game} sx={{ flex: 1 }} />}
      </ErrorBoundary>
    </Panel>
  );
}

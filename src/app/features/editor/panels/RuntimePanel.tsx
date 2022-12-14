import { useSelector } from "../../../store";
import { selectors } from "../selectors";
import { Panel } from "../components/Panel";
import { GameRuntime } from "../../runtime/GameRuntime";
import type { PanelProps } from "./definition";

export function RuntimePanel(props: PanelProps) {
  const game = useSelector(selectors.game);
  return (
    <Panel {...props}>
      {game && <GameRuntime game={game} sx={{ flex: 1 }} />}
    </Panel>
  );
}

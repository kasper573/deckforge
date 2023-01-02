import { adapter } from "../definition";
import { IdleScene } from "./IdleScene";
import { BattleScene } from "./BattleScene";
import { ResultScene } from "./ResultScene";

export function Scenes() {
  const status = adapter.useRuntimeState((state) => state.status);
  switch (status.type) {
    case "idle":
      return <IdleScene />;
    case "battle":
      return <BattleScene />;
    case "result":
      return <ResultScene winner={status.winner} />;
  }
}

import { adapter } from "../runtimeDefinition";
import { DeckSelectScene } from "./DeckSelectScene";
import { BattleScene } from "./BattleScene";
import { ResultScene } from "./ResultScene";

export function Scenes() {
  const status = adapter.useRuntimeState((state) => state.properties.status);
  switch (status.type) {
    case "idle":
      return <DeckSelectScene />;
    case "battle":
      return <BattleScene />;
    case "result":
      return <ResultScene winner={status.winner} />;
  }
}

import type { RuntimeDefinition } from "../compiler/types";
import type {
  GameDefinition,
  GameTypeId,
} from "../../../api/services/game/types";

export interface GameType {
  id: GameTypeId;
  name: string;
  defaultGameDefinition: GameDefinition;
  runtimeDefinition: RuntimeDefinition;
}

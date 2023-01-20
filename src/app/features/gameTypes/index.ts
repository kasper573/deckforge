import type { GameTypeId } from "../../../api/services/game/types";
import { reactVersus } from "./versus/react/gameType";
import { pixiVersus } from "./versus/pixi/gameType";
import type { GameType } from "./GameType";

export const gameTypeList: GameType[] = [reactVersus, pixiVersus];
export const gameTypes = gameTypeList.reduce(
  (record, type) => ({
    ...record,
    [type.id]: type,
  }),
  {} as Record<GameTypeId, GameType>
);

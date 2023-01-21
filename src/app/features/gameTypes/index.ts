import type { GameTypeId } from "../../../api/services/game/types";
import { reactVersus } from "./versus/gameType";
import { excaliburVersus } from "./excalibur/gameType";
import type { GameType } from "./GameType";

export const gameTypeList: GameType[] = [reactVersus, excaliburVersus];
export const gameTypes = gameTypeList.reduce(
  (record, type) => ({
    ...record,
    [type.id]: type,
  }),
  {} as Record<GameTypeId, GameType>
);

import type { GameTypeId } from "../../../api/services/game/types";
import { reactVersus } from "./versus/gameType";
import { excaliburVersus } from "./excalibur/gameType";
import type { GameType } from "./GameType";

export const gameTypeList: GameType[] = [reactVersus, excaliburVersus];
export const gameTypes = gameTypeList.reduce(
  (map, type) => map.set(type.id, type),
  new Map<GameTypeId, GameType>()
);

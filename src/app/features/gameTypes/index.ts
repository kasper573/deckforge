import type { GameTypeId } from "../../../api/services/game/types";
import { reactVersus } from "./versus/gameType";
import { gameTypeDemo } from "./game-type-demo/gameType";
import type { GameType } from "./GameType";

export const gameTypeList: GameType[] = [reactVersus, gameTypeDemo];
export const gameTypes = gameTypeList.reduce(
  (map, type) => map.set(type.id, type),
  new Map<GameTypeId, GameType>()
);

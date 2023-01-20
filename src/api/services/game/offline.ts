import { z } from "zod";
import { v4 } from "uuid";
import produce from "immer";
import { createZodStorage } from "../../../lib/zod-extensions/zodStorage";
import type { LinkInterceptors } from "../../../lib/trpc-intercept";
import { authStore, isAuthenticated } from "../../../app/features/auth/store";
import type { Game, GameId } from "./types";
import { gameIdType, gameType } from "./types";
import type { GameService } from "./service";

export function createOfflineGameService(): LinkInterceptors<GameService> {
  const storage = createZodStorage(
    z.map(gameIdType, gameType),
    "local-game-storage",
    new Map()
  );

  const map = storage.load();
  const save = () => storage.save(map);

  return {
    create(input) {
      const gameId = v4() as GameId;
      const game: Game = {
        ...input,
        gameId,
        updatedAt: new Date(),
        ownerId: "offline",
      };
      map.set(gameId, game);
      save();
      return game;
    },
    read(input) {
      const game = map.get(input);
      if (!game) {
        throw new Error("Game does not exist");
      }
      return game;
    },
    update(input) {
      const game = map.get(input.gameId);
      if (!game) {
        throw new Error("Game does not exist");
      }
      const updatedGame = produce(game, (draft) => {
        Object.assign(draft, input);
      });
      map.set(updatedGame.gameId, updatedGame);
      save();
      return updatedGame;
    },
    delete(input) {
      const deleted = map.delete(input);
      if (!deleted) {
        throw new Error("Game does not exist");
      }
    },
    list(input) {
      return {
        total: map.size,
        entities: Array.from(map.values()),
      };
    },
  };
}

export const shouldUseOfflineGameService = (authState = authStore.getState()) =>
  !isAuthenticated(authState);

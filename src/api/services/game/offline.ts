import { z } from "zod";
import { v4 } from "uuid";
import produce from "immer";
import { createZodStorage } from "../../../lib/zod-extensions/zodStorage";
import type { LinkInterceptors } from "../../../lib/trpc-intercept";
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

  function gameExists(byName?: string) {
    return [...map.values()].find((game) => game.name === byName);
  }

  function assertNoGameExists(byName?: string, exception?: Game) {
    const existing = gameExists(byName);
    if (existing && existing !== exception) {
      throw new Error(`A game with this name already exists`);
    }
  }

  function assertGame(byId: GameId) {
    const game = map.get(byId);
    if (!game) {
      throw new Error(`Game not found`);
    }
    return game;
  }

  return {
    create(input) {
      assertNoGameExists(input.name);

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
      return assertGame(input);
    },
    update(input) {
      let game = assertGame(input.gameId);
      assertNoGameExists(input.name, game);
      game = produce(game, (draft) => Object.assign(draft, input));
      map.set(game.gameId, game);
      save();
      return game;
    },
    delete(input) {
      assertGame(input);
      map.delete(input);
      save();
    },
    list(input) {
      return {
        total: map.size,
        entities: Array.from(map.values()),
      };
    },
  };
}

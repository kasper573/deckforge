import { t } from "./trpc";
import type { GameService } from "./services/game";
import type { UserService } from "./services/user/service";
import type { DeckService } from "./services/deck";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  game: GameService;
  user: UserService;
  deck: DeckService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;

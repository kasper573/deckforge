import { t } from "./trpc";
import type { GameService } from "./services/game/service";
import type { UserService } from "./services/user/service";

export function createApiRouter(services: ApiServices) {
  return t.router(services);
}

export type ApiServices = {
  game: GameService;
  user: UserService;
};

export type ApiRouter = ReturnType<typeof createApiRouter>;

import { t } from "./trpc";
import { access } from "./middlewares/access";
import type { GameService } from "./services/game";
import type { UserService } from "./services/user/service";

export function createApiRouter(services: ApiServices) {
  return t.router({
    public: t.procedure.query(() => "public data"),
    private: t.procedure.use(access()).query(() => "private data"),
    ...services,
  });
}

export interface ApiServices {
  game: GameService;
  user: UserService;
}

export type ApiRouter = ReturnType<typeof createApiRouter>;

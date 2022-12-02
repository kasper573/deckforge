import { t } from "./trpc";
import { access } from "./middlewares/access";
import { gameService } from "./services/game";
import { userService } from "./services/user/service";

export function createApiRouter() {
  return t.router({
    public: t.procedure.query(() => "public data"),
    private: t.procedure.use(access()).query(() => "private data"),
    game: gameService,
    user: userService,
  });
}

export type ApiRouter = ReturnType<typeof createApiRouter>;

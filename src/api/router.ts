import { t } from "./trpc";
import { access } from "./middlewares/access";
import { gameService } from "./services/game";

export function createApiRouter() {
  return t.router({
    public: t.procedure.query(() => "public data"),
    private: t.procedure.use(access()).query(() => "private data"),
    game: gameService,
  });
}

export type ApiRouter = ReturnType<typeof createApiRouter>;

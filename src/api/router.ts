import { t } from "./trpc";
import { access } from "./middlewares/access";

export function createApiRouter() {
  return t.router({
    public: t.procedure.query(() => "public data"),
    private: t.procedure.use(access()).query(() => "private data"),
  });
}

export type ApiRouter = ReturnType<typeof createApiRouter>;

import { authRouter } from "../services/auth";
import { exampleRouter } from "../services/example";
import { t } from "./trpc";

export const apiRouter = t.router({
  example: exampleRouter,
  auth: authRouter,
});

// export type definition of API
export type ApiRouter = typeof apiRouter;

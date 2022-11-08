import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { t } from "../trpc";

export const apiRouter = t.router({
  example: exampleRouter,
  auth: authRouter,
});

// export type definition of API
export type ApiRouter = typeof apiRouter;

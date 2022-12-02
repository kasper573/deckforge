import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { Request as JWTRequest } from "express-jwt";
import { createApiRouter } from "./router";
import { createDatabaseClient } from "./db";
import { env } from "./env";
import { createAuthenticator } from "./services/user/authenticator";
import { createGameService } from "./services/game";
import { createUserService } from "./services/user/service";

export function createServer() {
  const server = express();
  const db = createDatabaseClient();
  const auth = createAuthenticator({ jwtSecret: env.jwtSecret });
  const router = createApiRouter({
    game: createGameService(),
    user: createUserService(auth),
  });

  server.use(auth.middleware);
  server.use(
    "/api",
    trpcExpress.createExpressMiddleware({
      router: router,
      createContext({ req }: { req: JWTRequest }) {
        return { db, user: auth.check(req) };
      },
    })
  );

  return server;
}

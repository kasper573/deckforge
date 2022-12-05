import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createApiRouter } from "./router";
import { createDatabaseClient } from "./db";
import { env } from "./env";
import { createAuthenticator } from "./services/user/authenticator";
import { createGameService } from "./services/game";
import { createUserService } from "./services/user/service";
import { createDeckService } from "./services/deck";

export function createServer() {
  const server = express();
  const db = createDatabaseClient();
  const auth = createAuthenticator();
  const router = createApiRouter({
    game: createGameService(),
    user: createUserService(auth),
    deck: createDeckService(),
  });

  server.use(
    "/api",
    trpcExpress.createExpressMiddleware({
      router,
      createContext: ({ req }) => ({ db, user: auth.check(req) }),
      onError({ error }) {
        if (env.serverLogs.includes("error")) {
          console.error(error);
        }
      },
    })
  );

  return server;
}

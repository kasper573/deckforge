import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { Request as JWTRequest } from "express-jwt";
import { createApiRouter } from "./router";
import { createDatabaseClient } from "./db";
import type { Context } from "./trpc";
import { env } from "./env";
import { createAuthenticator } from "./services/user/authenticator";
import { createGameService } from "./services/game";
import { createUserService } from "./services/user/service";

export function createServer() {
  const server = express();
  const db = createDatabaseClient();
  const authenticator = createAuthenticator({ secret: env.jwtSecret });
  const router = createApiRouter({
    game: createGameService(),
    user: createUserService(authenticator),
  });

  server.use(
    "/api", // Has to be /api because of Vercel's Serverless Function entrypoint
    trpcExpress.createExpressMiddleware({
      router: router,
      async createContext({
        req,
        res,
      }: {
        req: JWTRequest;
        res: express.Response;
      }): Promise<Context> {
        return { db, user: await authenticator.check(req, res) };
      },
    })
  );

  return server;
}

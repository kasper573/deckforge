import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { Request as JWTRequest } from "express-jwt";
import { createApiRouter } from "./router";
import { createDatabaseClient } from "./db";
import type { Context } from "./trpc";
import { env } from "./env";
import { createAuthenticator } from "./services/user/authenticator";

export function createServer() {
  const server = express();
  const db = createDatabaseClient();
  const auth = createAuthenticator(env.auth);

  server.use(
    "/api", // Has to be /api because of Vercel's Serverless Function entrypoint
    trpcExpress.createExpressMiddleware({
      router: createApiRouter(),
      async createContext({
        req,
        res,
      }: {
        req: JWTRequest;
        res: express.Response;
      }): Promise<Context> {
        return { db, auth, user: await auth.check(req, res) };
      },
    })
  );

  return server;
}

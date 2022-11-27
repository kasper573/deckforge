import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { Request as JWTRequest } from "express-jwt";
import { createApiRouter } from "./router";
import { createPrismaClient } from "./prisma";
import type { Context } from "./trpc";
import { createJWTMiddleware } from "./services/auth/checkJWT";
import type { AuthContext } from "./services/auth/types";

export function createServer() {
  const server = express();
  const prisma = createPrismaClient();
  const checkJWT = createJWTMiddleware();

  server.use(
    "/api", // Has to be /api because of Vercel's Serverless Function entrypoint
    trpcExpress.createExpressMiddleware({
      router: createApiRouter(),
      async createContext({
        req,
        res,
      }: {
        req: JWTRequest<AuthContext>;
        res: express.Response;
      }): Promise<Context> {
        await checkJWT(req, res, () => {});
        const { auth } = req;
        return { prisma, auth };
      },
    })
  );

  return server;
}

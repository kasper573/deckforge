import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { Request as JWTRequest } from "express-jwt";
import type * as jwt from "jsonwebtoken";
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
        req: JWTRequest;
        res: express.Response;
      }): Promise<Context> {
        await checkJWT(req, res, () => {});
        const { auth } = req;
        return { prisma, auth: auth ? createAuthContext(auth) : undefined };
      },
    })
  );

  return server;
}

function createAuthContext(jwt: jwt.JwtPayload): AuthContext | undefined {
  if (!jwt.sub) {
    console.warn("JWT does not contain a string sub property", jwt);
    return;
  }
  return {
    id: jwt.sub,
    name: jwt.sub,
    role: "User",
  };
}

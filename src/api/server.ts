import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { GetVerificationKey, Request as JWTRequest } from "express-jwt";
import { expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import { createApiRouter } from "./router";
import { createPrismaClient } from "./prisma";
import type { Context } from "./trpc";
import { env } from "./env";
import type { JWTPayload } from "./trpc";

export function createServer() {
  const server = express();
  const prisma = createPrismaClient();

  server.use(
    "/api", // Has to be /api because of Vercel's Serverless Function entrypoint
    trpcExpress.createExpressMiddleware({
      router: createApiRouter(),
      async createContext({
        req,
        res,
      }: {
        req: JWTRequest<JWTPayload>;
        res: express.Response;
      }): Promise<Context> {
        await jwtExpressMiddleware(req, res, () => {});
        const { auth } = req;
        return { prisma, auth };
      },
    })
  );

  return server;
}

const jwtExpressMiddleware = expressjwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: env.jwks.requestsPerMinute,
    jwksUri: env.jwks.uri,
  }) as GetVerificationKey,
  audience: env.jwt.audience,
  issuer: env.jwt.issuer,
  algorithms: env.jwt.algorithms,
});

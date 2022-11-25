import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createApiRouter } from "./router";
import { createPrismaClient } from "./prisma";
import type { Context } from "./trpc";

export function createServer() {
  const server = express();
  const prisma = createPrismaClient();
  server.use(
    "/api", // Has to be /api because of Vercel's Serverless Function entrypoint
    createExpressMiddleware({
      router: createApiRouter(),
      createContext: (): Context => ({ prisma }),
    })
  );
  return server;
}

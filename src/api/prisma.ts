import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export function createPrismaClient() {
  const client =
    global.prisma ||
    new PrismaClient({
      log:
        env.environment === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

  if (env.environment !== "production") {
    global.prisma = client;
  }

  return client;
}

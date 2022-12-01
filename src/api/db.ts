import { PrismaClient } from "@prisma/client";
import { env } from "./env";

export function createDatabaseClient() {
  return new PrismaClient({ log: env.databaseLogs });
}

import { PrismaClient } from "@prisma/client";
import { env } from "./env";

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export function createDatabaseClient() {
  return new PrismaClient({ log: env.databaseLogs });
}

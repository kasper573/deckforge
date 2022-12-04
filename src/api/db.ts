/* eslint-disable @typescript-eslint/no-restricted-imports */
export { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { env } from "./env";

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export function createDatabaseClient() {
  return new PrismaClient({ log: env.databaseLogs });
}

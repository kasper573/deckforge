import { PrismaClient } from "@prisma/client";
import { env } from "./env";

export function createPrismaClient() {
  return new PrismaClient({ log: env.prismaLogs });
}

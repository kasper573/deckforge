import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { PrismaClient } from "@prisma/client";
import type { UserRole } from "@prisma/client";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export interface Session {
  user: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export type Context = {
  session?: Session;
  prisma: PrismaClient;
};

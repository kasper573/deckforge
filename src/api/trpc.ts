import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { PrismaClient } from "@prisma/client";
import type { AuthContext } from "./services/auth/types";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export type Context = {
  auth?: AuthContext;
  prisma: PrismaClient;
};

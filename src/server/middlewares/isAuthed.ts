import type { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/trpc";

export function isAuthed(requiredRole?: UserRole) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (requiredRole !== undefined && ctx.session.user.role !== requiredRole) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });
}

import type { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc/trpc";
import { getAccessLevel } from "../common/getAccessLevel";

export function access(requiredRole: UserRole = "User") {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const accessLevel = getAccessLevel(ctx.session.user.role);
    const requiredAccessLevel = getAccessLevel(requiredRole);
    if (accessLevel < requiredAccessLevel) {
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

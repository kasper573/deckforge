import type { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { getAccessLevel } from "../services/auth/utils";

export function access(requiredRole: UserRole = "User") {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.auth) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const accessLevel = getAccessLevel(ctx.auth.role);
    const requiredAccessLevel = getAccessLevel(requiredRole);
    if (accessLevel < requiredAccessLevel) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({
      ctx: {
        // infers the `auth` property as defined
        auth: ctx.auth,
      },
    });
  });
}

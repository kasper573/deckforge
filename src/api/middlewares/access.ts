import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import type { UserRole } from "../services/user/types";
import { roleToAccessLevel } from "../services/user/types";

export function access(leastRequiredRole: UserRole = "User") {
  return t.middleware((opts) => {
    const { ctx, next } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (ctx.user.access < roleToAccessLevel(leastRequiredRole)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx: { user: ctx.user } });
  });
}

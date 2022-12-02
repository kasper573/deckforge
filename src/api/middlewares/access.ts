import { TRPCError } from "@trpc/server";
import { t } from "../trpc";
import { UserAccessLevel } from "../services/user/types";

export function access(requiredAccess = UserAccessLevel.User) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    if (ctx.user.access < requiredAccess) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx: { user: ctx.user } });
  });
}
